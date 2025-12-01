import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiMapPin, FiHome, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Listing {
  _id: string;
  title: string;
  price: number;
  location: {
    address: string;
    city: string;
    district: string;
  };
  roomDetails: {
    area: number;
  };
  images: string[];
  rating?: {
    average: number;
    count: number;
  };
  customId?: string;
}

const StayedListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStayedListings();
    }
  }, [user]);

  const fetchStayedListings = async () => {
    try {
      const response = await axios.get('/api/users/stayed-listings');
      setListings(response.data.listings);
    } catch (error) {
      console.error('Failed to fetch stayed listings:', error);
      toast.error('Không thể tải danh sách phòng đã ở');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Vui lòng đăng nhập để xem phòng đã ở
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Phòng đã từng ở</h1>

      {listings.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Bạn chưa đánh dấu phòng nào là đã từng ở
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Đánh dấu phòng là "đã ở" để có thể đánh giá và bình luận về phòng đó
          </p>
          <Link to="/listings" className="btn-primary inline-block">
            Khám phá phòng trọ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing._id}
              to={`/listings/${listing._id}`}
              className="card overflow-hidden group hover:shadow-lg transition-shadow duration-300"
            >
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
                {listing.customId && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {listing.customId}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {listing.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <FiMapPin className="mr-1" size={14} />
                  {listing.location.district}, {listing.location.city}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="text-primary-600 font-bold text-xl">
                    {formatPrice(listing.price)}/tháng
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {listing.roomDetails.area}m²
                  </div>
                </div>

                {listing.rating && listing.rating.count > 0 ? (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FiStar className="fill-current" size={16} />
                    <span className="text-sm font-medium">
                      {listing.rating.average.toFixed(1)} ({listing.rating.count} đánh giá)
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Chưa có đánh giá
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StayedListings;

