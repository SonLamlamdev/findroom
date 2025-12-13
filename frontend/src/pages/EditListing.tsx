import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import MapPicker from '../components/MapPicker';
import { FiUpload, FiX } from 'react-icons/fi';
import { getImageUrl } from '../utils/imageHelper';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
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
    rules: '',
    status: 'available'
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

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`/api/listings/${id}`);
      const listing = response.data.listing;
      
      setFormData({
        title: listing.title,
        description: listing.description,
        price: listing.price.toString(),
        deposit: listing.deposit?.toString() || '',
        address: listing.location.address,
        city: listing.location.city || 'TP.HCM',
        district: listing.location.district,
        coordinates: listing.location.coordinates || null,
        area: listing.roomDetails.area.toString(),
        capacity: listing.roomDetails.capacity.toString(),
        bedrooms: listing.roomDetails.bedrooms?.toString() || '1',
        bathrooms: listing.roomDetails.bathrooms?.toString() || '1',
        roomType: listing.roomDetails.roomType,
        amenities: listing.amenities || [],
        rules: listing.rules || '',
        status: listing.status
      });

      setExistingImages(listing.images || []);
    } catch (error) {
      toast.error('Không thể tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

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
    
    if (existingImages.length + selectedFiles.length + files.length > 10) {
      toast.error('Tối đa 10 ảnh/video');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Kích thước file không được vượt quá 10MB');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.coordinates) {
      toast.error('Vui lòng chọn vị trí trên bản đồ');
      return;
    }

    setSaving(true);

    try {
      const formDataToSend = new FormData();

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
        rules: formData.rules,
        status: formData.status,
        images: existingImages
      };

      formDataToSend.append('data', JSON.stringify(data));

      selectedFiles.forEach(file => {
        formDataToSend.append('media', file);
      });

      await axios.put(`/api/listings/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Đã cập nhật tin thành công!');
      navigate(`/listings/${id}`);
    } catch (error) {
      toast.error('Không thể cập nhật tin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chỉnh sửa tin đăng</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Status */}
          <div className="card p-6">
            <label className="block text-sm font-medium mb-2">Trạng thái tin đăng</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="available">Còn trống</option>
              <option value="rented">Đã cho thuê</option>
              <option value="hidden">Ẩn tin</option>
            </select>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">📸 Ảnh & Video</h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ảnh hiện tại:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={getImageUrl(url)}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div className="mb-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                  <FiUpload className="mx-auto text-gray-400 mb-2" size={40} />
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    Thêm ảnh/video mới
                  </p>
                  <p className="text-sm text-gray-500">
                    Tối đa {10 - existingImages.length} file còn lại
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

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`New ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rest of the form - same structure as CreateListing */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">📝 Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mô tả *</label>
                <textarea
                  required
                  rows={6}
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Giá thuê (VNĐ/tháng) *</label>
                  <input
                    type="number"
                    required
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tiền cọc (VNĐ)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location with Map */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">📍 Vị trí</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Địa chỉ *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quận/Huyện *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
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
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary disabled:opacity-50 py-3 font-semibold"
            >
              {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/listings/${id}`)}
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

export default EditListing;
