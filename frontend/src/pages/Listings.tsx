import { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiMapPin, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import DistrictAutocomplete from '../components/DistrictAutocomplete';

interface Listing {
  _id: string;
  title: string;
  price: number;
  customId?: string;
  location: {
    address: string;
    city: string;
    district: string;
  };
  roomDetails: {
    area: number;
    roomType: string;
  };
  images: string[];
  landlord: {
    name: string;
    verifiedBadge: boolean;
  };
}

const Listings = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    city: '',
    district: '',
    amenities: [] as string[]
  });
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const commonAmenities = [
    'Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Máy giặt',
    'Wifi', 'Bãi đỗ xe', 'Thang máy', 'An ninh 24/7',
    'Cho phép nấu ăn', 'Gần trường', 'Gần chợ', 'Gần bệnh viện'
  ];

  useEffect(() => {
    fetchListings();
  }, [sortBy]);

  useEffect(() => {
    if (user) {
      fetchSavedListings();
    } else {
      setSavedListingIds([]);
    }
  }, [user]);

  // Refresh saved listings when navigating back to this page
  useEffect(() => {
    if (user && location.pathname === '/listings') {
      fetchSavedListings();
    }
  }, [location.pathname, user]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'amenities' && Array.isArray(value) && value.length > 0) {
          params.append('amenities', value.join(','));
        } else if (value && key !== 'amenities') {
          params.append(key, value.toString());
        }
      });

      if (sortBy) params.append('sort', sortBy);

      const response = await axios.get(`/api/listings?${params.toString()}`);
      setListings(response.data.listings);
    } catch (error) {
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedListings = async () => {
    try {
      const response = await axios.get('/api/users/saved-listings');
      const savedIds = response.data.listings.map((listing: Listing) => listing._id);
      setSavedListingIds(savedIds);
    } catch (error) {
      console.error('Failed to fetch saved listings:', error);
    }
  };

  const handleToggleSave = async (listingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu phòng trọ');
      return;
    }

    try {
      const response = await axios.post(`/api/users/saved-listings/${listingId}`);
      
      if (response.data.saved) {
        setSavedListingIds([...savedListingIds, listingId]);
        toast.success('Đã lưu phòng trọ');
      } else {
        setSavedListingIds(savedListingIds.filter(id => id !== listingId));
        toast.success('Đã hủy lưu phòng trọ');
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
      toast.error('Không thể lưu phòng trọ');
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSearch = () => {
    fetchListings();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Danh sách phòng trọ</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilterSidebar(!showFilterSidebar)}
            className="btn-secondary"
          >
            {showFilterSidebar ? 'Ẩn' : 'Hiện'} Bộ lọc
          </button>
          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-createdAt">Mới nhất</option>
            <option value="createdAt">Cũ nhất</option>
            <option value="price">Giá tăng dần</option>
            <option value="-price">Giá giảm dần</option>
            <option value="rating">Đánh giá cao</option>
            <option value="views">Nhiều lượt xem</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilterSidebar && (
          <div className="w-64 card p-6 h-fit sticky top-4">
            <h3 className="font-bold mb-4">Bộ lọc</h3>
            
            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Từ khóa..."
                className="input w-full"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Khoảng giá (VNĐ/tháng)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Tối thiểu"
                  className="input"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Tối đa"
                  className="input"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
            </div>

            {/* Room Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Loại phòng</label>
              <select
                className="input w-full"
                value={filters.roomType}
                onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
              >
                <option value="">Tất cả</option>
                <option value="single">Phòng đơn</option>
                <option value="shared">Phòng ghép</option>
                <option value="apartment">Căn hộ</option>
                <option value="house">Nhà nguyên căn</option>
              </select>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Khu vực</label>
              <input
                type="text"
                placeholder="Thành phố"
                className="input w-full mb-2"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
              <DistrictAutocomplete
                value={filters.district}
                onChange={(district) => setFilters({ ...filters, district })}
                placeholder="Quận/Huyện"
              />
            </div>

            {/* Amenities */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tiện nghi</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {commonAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="mr-2 w-4 h-4"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleSearch} className="btn-primary w-full">
              Áp dụng bộ lọc
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${showFilterSidebar ? '' : 'max-w-full'}`}>
          {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing._id}
              to={`/listings/${listing._id}`}
              className="card overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {listing.images[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiHome size={48} className="text-gray-400" />
                  </div>
                )}
                
                {/* Save Button */}
                {user && (
                  <button
                    className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                      savedListingIds.includes(listing._id)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={(e) => handleToggleSave(listing._id, e)}
                    title={savedListingIds.includes(listing._id) ? 'Hủy lưu' : 'Lưu phòng trọ'}
                  >
                    <FiHeart className={savedListingIds.includes(listing._id) ? 'fill-current' : ''} />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                    {listing.title}
                  </h3>
                  {listing.customId && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">
                      {listing.customId}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <FiMapPin className="mr-1" size={14} />
                  {listing.location.district}, {listing.location.city}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-primary-600 font-bold text-xl">
                    {formatPrice(listing.price)}/tháng
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {listing.roomDetails.area}m²
                  </div>
                </div>

                {listing.landlord.verifiedBadge && (
                  <div className="mt-2 inline-flex items-center text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    ✓ Chủ trọ uy tín
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

          {!loading && listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Không tìm thấy phòng trọ phù hợp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;








