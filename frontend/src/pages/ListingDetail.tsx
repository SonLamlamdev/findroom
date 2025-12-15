import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { FiMapPin, FiHome, FiUsers, FiCheck, FiHeart, FiStar, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/errorHandler';
import { getImageUrl, getAvatarUrl } from '../utils/imageHelper';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      toast.error(t('common.error'));
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
      toast.error(t('listingDetail.errors.loginToSave'));
      return;
    }
    try {
      const response = await axios.post(`/api/users/saved-listings/${id}`);
      setIsSaved(response.data.saved);
      toast.success(response.data.saved ? t('listingDetail.buttons.saved') : t('common.success'));
    } catch (error) {
      console.error('Failed to toggle save:', error);
      toast.error(t('common.error'));
    }
  };

  const handleMarkAsStayed = async () => {
    if (!user) {
      toast.error(t('listingDetail.errors.loginToReview'));
      return;
    }
    if (!stayedAt) {
      toast.error(t('listingDetail.errors.noDate'));
      return;
    }
    try {
      await axios.post(`/api/users/stayed-listings/${id}`, { stayedAt });
      setHasStayed(true);
      toast.success(t('listingDetail.errors.markSuccess'));
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error(t('listingDetail.errors.loginToReview'));
      return;
    }
    if (!hasStayed) {
      toast.error(t('listingDetail.errors.mustStay'));
      return;
    }
    if (!reviewComment.trim()) {
      toast.error(t('listingDetail.errors.noComment'));
      return;
    }
    try {
      await axios.post('/api/reviews', {
        listing: id,
        rating: { overall: reviewRating },
        comment: reviewComment,
        stayedAt: stayedAt || new Date().toISOString()
      });
      toast.success(t('listingDetail.reviews.success'));
      setShowReviewForm(false);
      setReviewComment('');
      fetchReviews();
      fetchListing(); 
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, t('common.error'));
      toast.error(errorMessage);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Helper to check if current user is the owner
  const isOwner = user && listing && user._id === listing.landlord._id;

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
        <p className="text-xl text-gray-600 dark:text-gray-400">{t('listingDetail.notFound')}</p>
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
                  ({listing.rating.count} {t('listingDetail.reviews.title').toLowerCase()})
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
                {listing.roomDetails.capacity} {t('listingDetail.capacity')}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">{t('listingDetail.description')}</h2>
            <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
              {listing.description}
            </p>
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">{t('listingDetail.amenities')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {listing.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <FiCheck className="text-green-500 mr-2" />
                  {amenityMapping[amenity] 
                    ? t(`create.amenities.${amenityMapping[amenity]}`) 
                    : amenity}
                </div>
              ))}
            </div>
          </div>

          {listing.rules && (
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-4">{t('listingDetail.rules')}</h2>
              <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">
                {listing.rules}
              </p>
            </div>
          )}

          {/* Reviews Section */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{t('listingDetail.reviews.title')}</h2>
              {/* Only show "Write Review" if user is tenant, has stayed, and form is hidden */}
              {user && !isOwner && hasStayed && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="btn-primary"
                >
                  {t('listingDetail.reviews.writeButton')}
                </button>
              )}
            </div>

            {showReviewForm && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-bold mb-4">{t('listingDetail.reviews.writeButton')}</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('listingDetail.reviews.ratingLabel')}</label>
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
                  <label className="block text-sm font-medium mb-2">{t('listingDetail.stayed.dateLabel')}</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={stayedAt}
                    onChange={(e) => setStayedAt(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">{t('listingDetail.reviews.commentLabel')}</label>
                  <textarea
                    className="input w-full"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t('listingDetail.reviews.commentPlaceholder')}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSubmitReview} className="btn-primary">
                    {t('listingDetail.reviews.submit')}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewComment('');
                    }}
                    className="btn-secondary"
                  >
                    {t('listingDetail.reviews.cancel')}
                  </button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                {t('listingDetail.reviews.empty')}
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
              {formatPrice(listing.price)}{t('listingDetail.price.perMonth')}
            </div>

            {listing.deposit > 0 && (
              <div className="text-gray-600 dark:text-gray-400 mb-6">
                {t('listingDetail.price.deposit')}: {formatPrice(listing.deposit)}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
              <h3 className="font-bold mb-3">{t('listingDetail.landlord.info')}</h3>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="font-medium mr-2">{listing.landlord.name}</span>
                  {listing.landlord.verifiedBadge && (
                    <span className="text-green-500 text-xs">✓ {t('listingDetail.landlord.verified')}</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📞 {listing.landlord.phone}
                </p>
              </div>
            </div>

            {/* FIXED: Show button for any logged-in user who is NOT the owner */}
            {user && !isOwner && (
              <button
                onClick={() => navigate(`/messages/${listing._id}/${listing.landlord._id}`)}
                className="w-full btn-primary mb-3 flex items-center justify-center"
              >
                <FiMessageCircle className="mr-2" />
                {t('listingDetail.buttons.message')}
              </button>
            )}
            
            {/* Save Button & Stayed Logic - Allowed for everyone except owner */}
            {user && !isOwner && (
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
                  {isSaved ? t('listingDetail.buttons.saved') : t('listingDetail.buttons.save')}
                </button>

                {!hasStayed && (
                  <div className="mb-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {t('listingDetail.stayed.hint')}
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
                      {t('listingDetail.buttons.markStayed')}
                    </button>
                  </div>
                )}

                {hasStayed && (
                  <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                    ✓ {t('listingDetail.buttons.markedStayed')}
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