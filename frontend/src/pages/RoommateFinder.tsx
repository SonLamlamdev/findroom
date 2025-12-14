import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { FiHeart, FiUser, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarUrl } from '../utils/imageHelper';
import { useTranslation } from 'react-i18next';

interface RoommateMatch {
  user: {
    id: string;
    name: string;
    avatar?: string;
    university: string;
    major: string;
    bio: string;
    budget: {
      min: number;
      max: number;
    };
    interests: string[];
  };
  compatibilityScore: number;
  matchReasons: string[];
}

const RoommateFinder = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<RoommateMatch[]>([]);
  const [savedRoommateIds, setSavedRoommateIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<RoommateMatch | null>(null);

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchSavedRoommates();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('/api/roommates/find');
      setMatches(response.data.matches);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setShowProfileSetup(true);
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedRoommates = async () => {
    try {
      const response = await axios.get('/api/roommates/saved/list');
      const savedIds = response.data.roommates.map((rm: any) => rm._id);
      setSavedRoommateIds(savedIds);
    } catch (error) {
      console.error('Failed to fetch saved roommates:', error);
    }
  };

  const handleSaveRoommate = async (roommateId: string) => {
    try {
      const response = await axios.post(`/api/roommates/save/${roommateId}`);
      if (response.data.saved) {
        setSavedRoommateIds([...savedRoommateIds, roommateId]);
        toast.success(t('common.success'));
      } else {
        setSavedRoommateIds(savedRoommateIds.filter(id => id !== roommateId));
        toast.success(t('common.success'));
      }
    } catch (error) {
      console.error('Failed to save roommate:', error);
      toast.error(t('common.error'));
    }
  };

  const handleContact = (roommateId: string) => {
    navigate(`/messages/${roommateId}`);
  };

  const formatPrice = (price: number) => {
    if (!price || price === 0) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-gray-100 dark:bg-gray-700';
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('roommate.loginTitle')}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('roommate.loginSubtitle')}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto card p-8">
          <h2 className="text-2xl font-bold mb-4">{t('roommate.setupProfileTitle')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('roommate.setupProfileSubtitle')}
          </p>
          <a href="/profile" className="btn-primary inline-block">
            {t('roommate.goToProfile')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('roommate.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('roommate.subtitle')}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t('roommate.empty')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div key={match.user.id} className="card overflow-hidden">
                {/* Avatar */}
                <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative">
                  <img
                    src={getAvatarUrl(match.user.avatar)}
                    alt={match.user.name}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                  
                  {/* Compatibility Score */}
                  <div className={`absolute top-4 right-4 ${getScoreBgColor(match.compatibilityScore)} px-3 py-1 rounded-full`}>
                    <span className={`font-bold ${getScoreColor(match.compatibilityScore)}`}>
                      {match.compatibilityScore}%
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{match.user.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {match.user.university} - {match.user.major}
                  </p>

                  {match.user.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {match.user.bio}
                    </p>
                  )}

                  {/* Budget */}
                  {match.user.budget && (match.user.budget.min > 0 || match.user.budget.max > 0) && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('roommate.profile.budget')}:</p>
                      <p className="font-semibold text-primary-600">
                        {match.user.budget.min > 0 ? formatPrice(match.user.budget.min) : t('roommate.profile.unlimited')} 
                        {' - '}
                        {match.user.budget.max > 0 ? formatPrice(match.user.budget.max) : t('roommate.profile.unlimited')}
                      </p>
                    </div>
                  )}

                  {/* Interests */}
                  {match.user.interests && match.user.interests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('roommate.profile.interests')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.user.interests.slice(0, 3).map((interest, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Reasons */}
                  {match.matchReasons.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">{t('roommate.profile.reasons')}:</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {match.matchReasons.slice(0, 2).map((reason, index) => (
                          <li key={index}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedProfile(match)}
                      className="flex-1 btn-primary text-sm"
                    >
                      {t('roommate.profile.viewProfile')}
                    </button>
                    <button 
                      onClick={() => handleSaveRoommate(match.user.id)}
                      className={`p-2 border rounded-lg transition-colors ${
                        savedRoommateIds.includes(match.user.id)
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      title={savedRoommateIds.includes(match.user.id) ? t('roommate.profile.saved') : t('roommate.profile.save')}
                    >
                      <FiHeart className={savedRoommateIds.includes(match.user.id) ? 'fill-current' : ''} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('roommate.profile.viewProfile')}</h2>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar & Basic Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={getAvatarUrl(selectedProfile.user.avatar)}
                    alt={selectedProfile.user.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{selectedProfile.user.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProfile.user.university} - {selectedProfile.user.major}
                    </p>
                    <div className={`inline-block mt-2 px-3 py-1 rounded-full ${
                      selectedProfile.compatibilityScore >= 80 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : selectedProfile.compatibilityScore >= 60
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {t('roommate.profile.match')}: {selectedProfile.compatibilityScore}%
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedProfile.user.bio && (
                  <div>
                    <h4 className="font-bold mb-2">{t('roommate.profile.intro')}</h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedProfile.user.bio}</p>
                  </div>
                )}

                {/* Budget */}
                {selectedProfile.user.budget && (selectedProfile.user.budget.min > 0 || selectedProfile.user.budget.max > 0) && (
                  <div>
                    <h4 className="font-bold mb-2">{t('roommate.profile.budget')}</h4>
                    <p className="text-primary-600 font-semibold">
                      {selectedProfile.user.budget.min > 0 ? formatPrice(selectedProfile.user.budget.min) : t('roommate.profile.unlimited')} 
                      {' - '}
                      {selectedProfile.user.budget.max > 0 ? formatPrice(selectedProfile.user.budget.max) : t('roommate.profile.unlimited')}
                    </p>
                  </div>
                )}

                {/* Interests */}
                {selectedProfile.user.interests && selectedProfile.user.interests.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">{t('roommate.profile.interests')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.user.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Reasons */}
                {selectedProfile.matchReasons.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">{t('roommate.profile.reasons')}</h4>
                    <ul className="space-y-1">
                      {selectedProfile.matchReasons.map((reason, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="flex-1 btn-secondary"
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={() => {
                      handleContact(selectedProfile.user.id);
                      setSelectedProfile(null);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle />
                    {t('roommate.profile.contact')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoommateFinder;