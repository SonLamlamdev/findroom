import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axios';
import { FiMapPin, FiHome, FiUsers, FiCheck, FiHeart, FiStar, FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import { getImageUrl, getAvatarUrl } from '../utils/imageHelper';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  deposit: number;
  customId?: string;
  location: {
    address: string;
    city: string;
    district: string;
  };
  roomDetails: {
    area: number;
    capacity: number;
    bedrooms: number;
    bathrooms: number;
    roomType: string;
  };
  amenities: string[];
  images: string[];
  landlord: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    verifiedBadge: boolean;
  };
  rules: string;
  rating?: {
    average: number;
    count: number;
  };
}

interface Review {
  _id: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
  rating: {
    overall: number;
  };
  comment: string;
  createdAt: string;
}

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [hasStayed, setHasStayed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [stayedAt, setStayedAt] = useState('');

  // Fallback image function
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Not+Found';
  };

  useEffect(() => {
    if (id) {
      fetchListing();
      fetchReviews();
      checkSavedStatus();
      checkStayedStatus();
    }
  }, [id, user]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`/api/listings/${id}`);
      setListing(response.data.listing);
    } catch (error) {
      toast.error('Không thể tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/listing/${id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const checkSavedStatus = async () => {
    if (!user) return;
    try {
      const response = await axios.get('/api/users/saved-listings');
      const savedIds = response.data.listings.map((l: Listing) => l._id);
      setIsSaved(savedIds.includes(id));
    } catch (error) {
      console.error('Failed to check saved status:', error);
    }
  };

  const checkStayedStatus = async () => {
    if (!user) return;
    try {
      const response = await axios.get('/api/users/stayed-listings');
      const stayedIds = response.data.listings.map((l: Listing) => l._id);
      setHasStayed(stayedIds.includes(id));
    } catch (error) {
      console.error('Failed to check stayed status:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu phòng');
      return;
    }
    try {
      const response = await axios.post(`/api/users/saved-listings/${id}`);
      setIsSaved(response.data.saved);
      toast.success(response.data.saved ? 'Đã lưu phòng' : 'Đã hủy lưu phòng');
    } catch (error) {
      console.error('Failed to toggle save:', error);
      toast.error('Không thể cập nhật');
    }
  };

  const handleMarkAsStayed = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    if (!stayedAt) {
      toast.error('Vui lòng chọn ngày đã ở');
      return;
    }
    try {
      await axios.post(`/api/users/stayed-listings/${id}`, { stayedAt });
      setHasStayed(true);
      toast.success('Đã đánh dấu phòng là đã ở');
    } catch (error) {
      toast.error('Không thể cập nhật');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    if (!hasStayed) {
      toast.error('Bạn phải đánh dấu phòng là "đã ở" trước khi đánh giá');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập bình luận');
      return;
    }
    try {
      await axios.post('/api/reviews', {
        listing: id,
        rating: { overall: reviewRating },
        comment: reviewComment,
        stayedAt: stayedAt || new Date().toISOString()
      });
      toast.success('Đánh giá thành công!');
      setShowReviewForm(false);
      setReviewComment('');
      fetchReviews();
      fetchListing(); 
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Không thể đánh giá');
      toast.error(errorMessage);
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

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">Không tìm thấy phòng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden relative">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={getImageUrl(listing.images[selectedImage])}
              alt={listing.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiHome size={64} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {listing.images && listing.images.slice(0, 6).map((image, index) => (
            <div
              key={index}
              className={`h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer ${
                selectedImage === index ? 'ring-2 ring-primary-600' : ''
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <img 
                src={getImageUrl(image)} 
                alt="" 
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">{listing.title}</h1>
              {listing.customId && (
                <span className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  ID: {listing.customId}
                </span>
              )}
            </div>
            
            {listing.rating && listing.rating.count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-yellow-500">
                  <FiStar className="fill-current" size={20} />
                  <span className="ml-1 font-bold text-lg">{listing.rating.average.toFixed(1)}</span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  ({listing.rating.count} đánh giá)
                </span>
              </div>
            )}
            
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
              <FiMapPin className="mr-2" />
              {listing.location.address}, {listing.location.district}, {listing.location.city}
            </div>

            <div className="flex gap-4 text-lg">
              <div className="flex items-center">
                <FiHome className="mr-2" />
                {listing.roomDetails.area}m²
              </div>
              <div className="flex items-center">
                <FiUsers className="mr-2" />
                {listing.roomDetails.capacity} người
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
              {listing.description}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Tiện nghi</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {listing.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {listing.rules && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-4">Nội quy</h2>
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                {listing.rules}
              </p>
            </div>
          )}

          {/* Reviews Section */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Đánh giá</h2>
              {user && user.role === 'tenant' && hasStayed && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary"
                >
                  Viết đánh giá
                </button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-bold mb-4">Viết đánh giá</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Đánh giá (sao)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl ${
                          star <= reviewRating
                            ? 'text-yellow-500'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        <FiStar className={star <= reviewRating ? 'fill-current' : ''} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Ngày đã ở</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={stayedAt}
                    onChange={(e) => setStayedAt(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Bình luận</label>
                  <textarea
                    className="input w-full"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSubmitReview} className="btn-primary">
                    Gửi đánh giá
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewComment('');
                    }}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={getAvatarUrl(review.reviewer.avatar)}
                          alt={review.reviewer.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={handleImageError}
                        />
                        <span className="font-medium">{review.reviewer.name}</span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={star <= review.rating.overall ? 'fill-current' : ''}
                            size={16}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 sticky top-20">
            <div className="text-3xl font-bold text-primary-600 mb-4">
              {formatPrice(listing.price)}/tháng
            </div>

            {listing.deposit > 0 && (
              <div className="text-gray-600 dark:text-gray-400 mb-6">
                Đặt cọc: {formatPrice(listing.deposit)}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h3 className="font-bold mb-3">Thông tin chủ trọ</h3>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="font-medium mr-2">{listing.landlord.name}</span>
                  {listing.landlord.verifiedBadge && (
                    <span className="text-green-500 text-xs">✓ Uy tín</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📞 {listing.landlord.phone}
                </p>
              </div>
            </div>

            {user && user.role === 'tenant' && (
              <button
                onClick={() => navigate(`/messages/${listing._id}/${listing.landlord._id}`)}
                className="w-full btn-primary mb-3 flex items-center justify-center"
              >
                <FiMessageCircle className="mr-2" />
                Nhắn tin cho chủ trọ
              </button>
            )}
            
            {user && user.role === 'tenant' && (
              <>
                <button
                  onClick={handleSaveToggle}
                  className={`w-full mb-3 flex items-center justify-center transition-colors ${
                    isSaved 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'btn-outline'
                  }`}
                >
                  <FiHeart className={`mr-2 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Đã lưu' : 'Lưu tin'}
                </button>

                {!hasStayed && (
                  <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Đánh dấu phòng là "đã ở" để có thể đánh giá
                    </p>
                    <input
                      type="date"
                      className="input w-full mb-2"
                      value={stayedAt}
                      onChange={(e) => setStayedAt(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <button
                      onClick={handleMarkAsStayed}
                      className="w-full btn-secondary text-sm"
                    >
                      Đánh dấu đã ở
                    </button>
                  </div>
                )}

                {hasStayed && (
                  <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                    ✓ Bạn đã đánh dấu phòng này là đã ở
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;