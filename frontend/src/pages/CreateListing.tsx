import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import MapPicker from '../components/MapPicker';
import DistrictAutocomplete from '../components/DistrictAutocomplete';
import { FiUpload, FiX } from 'react-icons/fi';
import { getErrorMessage } from '../utils/errorHandler';

const CreateListing = () => {
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

  const roomTypes = [
    { value: 'single', label: 'Phòng đơn' },
    { value: 'shared', label: 'Phòng ghép' },
    { value: 'apartment', label: 'Căn hộ' },
    { value: 'house', label: 'Nhà nguyên căn' }
  ];

  const commonAmenities = [
    'Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Máy giặt',
    'Wifi', 'Bãi đỗ xe', 'Thang máy', 'An ninh 24/7',
    'Cho phép nấu ăn', 'Gần trường', 'Gần chợ', 'Gần bệnh viện'
  ];

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
      toast.error('Tối đa 10 ảnh');
      return;
    }

    // Validate file size (10MB max)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Kích thước file không được vượt quá 10MB');
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
      toast.error('Vui lòng chọn vị trí trên bản đồ');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 ảnh');
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

      toast.success('Đã đăng tin thành công! 🎉');
      navigate(`/listings/${response.data.listing._id}`);
    } catch (error: any) {
      console.error(error);
      const errorMessage = getErrorMessage(error, 'Không thể đăng tin');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Đăng tin cho thuê phòng trọ</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Giống như đăng bài Facebook - Dễ dàng và nhanh chóng! ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Upload Photos */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">📸 Ảnh</h2>
            
            <div className="mb-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                  <FiUpload className="mx-auto text-gray-400 mb-2" size={40} />
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Click để chọn ảnh
                  </p>
                  <p className="text-sm text-gray-500">
                    Tối đa 10 file, mỗi file không quá 10MB
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
            <h2 className="text-xl font-bold mb-4">📝 Thông tin cơ bản</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiêu đề bài đăng *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Phòng trọ đẹp gần ĐH Bách Khoa, giá rẻ, đầy đủ tiện nghi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả chi tiết *
                </label>
                <textarea
                  required
                  rows={6}
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả chi tiết về phòng trọ: đặc điểm, ưu điểm, vị trí gần những gì, điều kiện thuê..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Giá thuê (VNĐ/tháng) *
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
                    Tiền cọc (VNĐ)
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
                  <label className="block text-sm font-medium mb-2">Diện tích (m²) *</label>
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
                  <label className="block text-sm font-medium mb-2">Số người *</label>
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
                  <label className="block text-sm font-medium mb-2">Phòng ngủ</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phòng tắm</label>
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
                <label className="block text-sm font-medium mb-2">Loại phòng *</label>
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
            <h2 className="text-xl font-bold mb-4">📍 Vị trí trên bản đồ</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số nhà, tên đường, phường/xã"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quận/Huyện *</label>
                  <DistrictAutocomplete
                    value={formData.district}
                    onChange={(district) => setFormData({ ...formData, district })}
                    placeholder="Quận 1, Quận 2..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Thành phố</label>
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
                // Auto-fill address when user selects location on map
                setFormData((prev) => ({ ...prev, address: addr }));
              }}
              onDistrictChange={(district) => {
                // Auto-fill district when user selects location on map
                if (district) {
                  setFormData((prev) => ({ ...prev, district: district }));
                }
              }}
            />
          </div>

          {/* Amenities */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">✨ Tiện nghi</h2>
            
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
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">📋 Nội quy</h2>
            <textarea
              rows={4}
              className="input"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="VD: Không hút thuốc, không nuôi thú cưng, giờ giấc tự do..."
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4 sticky bottom-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 py-3 text-lg font-semibold"
            >
              {loading ? '⏳ Đang đăng tin...' : '🚀 Đăng tin ngay'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary py-3 px-6"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
