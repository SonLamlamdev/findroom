import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import MapPicker from '../components/MapPicker';
import DistrictAutocomplete from '../components/DistrictAutocomplete';
import { FiUpload, FiX } from 'react-icons/fi';
import { getErrorMessage } from '../utils/errorHandler';
import { useTranslation } from 'react-i18next'; // Import Translation Hook

const CreateListing = () => {
  const { t } = useTranslation(); // Initialize Hook
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    deposit: '',
    address: '',
    city: 'TP.HCM',
    district: '',
    coordinates: null as { lat: number; lng: number } | null,
    area: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    roomType: 'single',
    amenities: [] as string[],
    rules: ''
  });

  // Room Types with translation keys
  const roomTypes = [
    { value: 'single', label: t('create.roomTypes.single') },
    { value: 'shared', label: t('create.roomTypes.shared') },
    { value: 'apartment', label: t('create.roomTypes.apartment') },
    { value: 'house', label: t('create.roomTypes.house') }
  ];

  // Mapping object for Amenities (Database Value -> Translation Key)
  const amenityMapping: { [key: string]: string } = {
    'Điều hòa': 'ac',
    'Nóng lạnh': 'heater',
    'Tủ lạnh': 'fridge',
    'Máy giặt': 'washer',
    'Wifi': 'wifi',
    'Bãi đỗ xe': 'parking',
    'Thang máy': 'elevator',
    'An ninh 24/7': 'security',
    'Cho phép nấu ăn': 'kitchen',
    'Gần trường': 'school',
    'Gần chợ': 'market',
    'Gần bệnh viện': 'hospital'
  };

  const commonAmenities = Object.keys(amenityMapping);

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > 10) {
      toast.error(t('create.errors.maxFiles'));
      return;
    }

    // Validate file size (10MB max)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(t('create.errors.fileSize'));
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coordinates) {
      toast.error(t('create.errors.location'));
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error(t('create.errors.minImage'));
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add data as JSON string
      const data = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        deposit: Number(formData.deposit),
        location: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          coordinates: formData.coordinates
        },
        roomDetails: {
          area: Number(formData.area),
          capacity: Number(formData.capacity),
          bedrooms: Number(formData.bedrooms) || 1,
          bathrooms: Number(formData.bathrooms) || 1,
          roomType: formData.roomType
        },
        amenities: formData.amenities,
        rules: formData.rules
      };

      formDataToSend.append('data', JSON.stringify(data));

      // Add files
      selectedFiles.forEach(file => {
        formDataToSend.append('media', file);
      });

      const response = await axios.post('/api/listings', formDataToSend, {
        headers: {
          'Content-Type': undefined
        }
      });

      toast.success(t('create.errors.success'));
      navigate(`/listings/${response.data.listing._id}`);
    } catch (error: any) {
      console.error(error);
      const errorMessage = getErrorMessage(error, t('common.error'));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('create.pageTitle')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('create.pageSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Upload Photos */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">{t('create.sections.media')}</h2>
            
            <div className="mb-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                  <FiUpload className="mx-auto text-gray-400 mb-2" size={40} />
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    {t('create.labels.upload')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('create.labels.uploadLimit')}
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Preview */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">{t('create.sections.basicInfo')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('create.labels.title')}
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('create.labels.titlePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('create.labels.description')}
                </label>
                <textarea
                  required
                  rows={6}
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('create.labels.descriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('create.labels.price')}
                  </label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('create.labels.deposit')}
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    placeholder="2000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('create.labels.area')}</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('create.labels.capacity')}</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('create.labels.bedrooms')}</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('create.labels.bathrooms')}</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('create.labels.roomType')}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {roomTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, roomType: type.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.roomType === type.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Location with Map */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">{t('create.sections.location')}</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('create.labels.address')}</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder={t('create.labels.address')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('create.labels.district')}</label>
                  <DistrictAutocomplete
                    value={formData.district}
                    onChange={(district) => setFormData({ ...formData, district })}
                    placeholder={t('create.labels.district')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('create.labels.city')}</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.city}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <MapPicker
              position={formData.coordinates}
              onPositionChange={(pos) => setFormData({ ...formData, coordinates: pos })}
              onAddressChange={(addr) => {
                setFormData((prev) => ({ ...prev, address: addr }));
              }}
              onDistrictChange={(district) => {
                if (district) {
                  setFormData((prev) => ({ ...prev, district: district }));
                }
              }}
            />
          </div>

          {/* Amenities */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">{t('create.sections.amenities')}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-sm">
                    {t(`create.amenities.${amenityMapping[amenity]}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">{t('create.sections.rules')}</h2>
            <textarea
              rows={4}
              className="input"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder={t('create.labels.rulesPlaceholder')}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 py-3 text-lg font-semibold"
            >
              {loading ? t('create.buttons.submitting') : t('create.buttons.submit')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary py-3 px-6"
            >
              {t('create.buttons.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;