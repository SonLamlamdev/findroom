import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiUser, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface SavedRoommate {
  _id: string;
  name: string;
  avatar?: string;
  roommateProfile: {
    university: string;
    major: string;
    bio: string;
    budget: {
      min: number;
      max: number;
    };
    interests: string[];
    habits: {
      sleepSchedule: string;
      cleanliness: number;
      noise: string;
      smoking: boolean;
      pets: boolean;
      cooking: string;
    };
  };
}

const SavedRoommates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roommates, setRoommates] = useState<SavedRoommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<SavedRoommate | null>(null);

  useEffect(() => {
    if (user) {
      fetchSavedRoommates();
    }
  }, [user]);

  const fetchSavedRoommates = async () => {
    try {
      const response = await axios.get('/api/roommates/saved/list');
      setRoommates(response.data.roommates);
    } catch (error) {
      console.error('Failed to fetch saved roommates:', error);
      toast.error('Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (roommateId: string) => {
    try {
      await axios.post(`/api/roommates/save/${roommateId}`);
      setRoommates(roommates.filter(rm => rm._id !== roommateId));
      toast.success('Đã xóa khỏi danh sách');
    } catch (error) {
      console.error('Failed to unsave roommate:', error);
      toast.error('Không thể xóa');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Đã lưu ghép trọ</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Danh sách những người bạn đã lưu để tìm bạn cùng phòng
          </p>
        </div>

        {roommates.length === 0 ? (
          <div className="card p-12 text-center">
            <FiHeart size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Bạn chưa lưu ai vào danh sách. Hãy tìm bạn cùng phòng và lưu những người phù hợp!
            </p>
            <a href="/roommate-finder" className="btn-primary inline-block mt-4">
              Tìm bạn cùng phòng
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roommates.map((roommate) => (
              <div key={roommate._id} className="card overflow-hidden">
                {/* Avatar */}
                <div className="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative">
                  {roommate.avatar ? (
                    <img
                      src={roommate.avatar}
                      alt={roommate.name}
                      className="w-24 h-24 rounded-full border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FiUser size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{roommate.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {roommate.roommateProfile.university} - {roommate.roommateProfile.major}
                  </p>

                  {roommate.roommateProfile.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {roommate.roommateProfile.bio}
                    </p>
                  )}

                  {/* Budget */}
                  {roommate.roommateProfile.budget && (roommate.roommateProfile.budget.min > 0 || roommate.roommateProfile.budget.max > 0) && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ngân sách:</p>
                      <p className="font-semibold text-primary-600">
                        {roommate.roommateProfile.budget.min > 0 ? formatPrice(roommate.roommateProfile.budget.min) : 'Không giới hạn'} 
                        {' - '}
                        {roommate.roommateProfile.budget.max > 0 ? formatPrice(roommate.roommateProfile.budget.max) : 'Không giới hạn'}
                      </p>
                    </div>
                  )}

                  {/* Interests */}
                  {roommate.roommateProfile.interests && roommate.roommateProfile.interests.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sở thích:</p>
                      <div className="flex flex-wrap gap-2">
                        {roommate.roommateProfile.interests.slice(0, 3).map((interest, index) => (
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

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedProfile(roommate)}
                      className="flex-1 btn-primary text-sm"
                    >
                      Xem hồ sơ
                    </button>
                    <button 
                      onClick={() => handleContact(roommate._id)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      title="Liên hệ"
                    >
                      <FiMessageCircle />
                    </button>
                    <button 
                      onClick={() => handleUnsave(roommate._id)}
                      className="p-2 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                      title="Xóa khỏi danh sách"
                    >
                      <FiHeart className="fill-current" />
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
                <h2 className="text-2xl font-bold">Hồ sơ {selectedProfile.name}</h2>
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
                  {selectedProfile.avatar ? (
                    <img
                      src={selectedProfile.avatar}
                      alt={selectedProfile.name}
                      className="w-24 h-24 rounded-full"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FiUser size={40} className="text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{selectedProfile.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProfile.roommateProfile.university} - {selectedProfile.roommateProfile.major}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {selectedProfile.roommateProfile.bio && (
                  <div>
                    <h4 className="font-bold mb-2">Giới thiệu</h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedProfile.roommateProfile.bio}</p>
                  </div>
                )}

                {/* Budget */}
                {selectedProfile.roommateProfile.budget && (selectedProfile.roommateProfile.budget.min > 0 || selectedProfile.roommateProfile.budget.max > 0) && (
                  <div>
                    <h4 className="font-bold mb-2">Ngân sách</h4>
                    <p className="text-primary-600 font-semibold">
                      {selectedProfile.roommateProfile.budget.min > 0 ? formatPrice(selectedProfile.roommateProfile.budget.min) : 'Không giới hạn'} 
                      {' - '}
                      {selectedProfile.roommateProfile.budget.max > 0 ? formatPrice(selectedProfile.roommateProfile.budget.max) : 'Không giới hạn'}
                    </p>
                  </div>
                )}

                {/* Interests */}
                {selectedProfile.roommateProfile.interests && selectedProfile.roommateProfile.interests.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">Sở thích</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.roommateProfile.interests.map((interest, index) => (
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

                {/* Habits */}
                {selectedProfile.roommateProfile.habits && (
                  <div>
                    <h4 className="font-bold mb-2">Thói quen</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Giờ ngủ:</span>
                        <span className="ml-2 font-medium">
                          {selectedProfile.roommateProfile.habits.sleepSchedule === 'early' ? 'Sớm' :
                           selectedProfile.roommateProfile.habits.sleepSchedule === 'late' ? 'Muộn' : 'Linh hoạt'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Độ sạch sẽ:</span>
                        <span className="ml-2 font-medium">{selectedProfile.roommateProfile.habits.cleanliness}/5</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Tiếng ồn:</span>
                        <span className="ml-2 font-medium">
                          {selectedProfile.roommateProfile.habits.noise === 'quiet' ? 'Yên tĩnh' :
                           selectedProfile.roommateProfile.habits.noise === 'moderate' ? 'Vừa phải' : 'Ồn ào'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Hút thuốc:</span>
                        <span className="ml-2 font-medium">{selectedProfile.roommateProfile.habits.smoking ? 'Có' : 'Không'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="flex-1 btn-secondary"
                  >
                    Đóng
                  </button>
                  <button 
                    onClick={() => {
                      handleContact(selectedProfile._id);
                      setSelectedProfile(null);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle />
                    Liên hệ
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

export default SavedRoommates;

