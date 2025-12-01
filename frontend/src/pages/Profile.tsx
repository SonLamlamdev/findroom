import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: ''
  });
  const [roommateProfile, setRoommateProfile] = useState({
    university: '',
    major: '',
    bio: '',
    lookingForRoommate: false,
    habits: {
      sleepSchedule: 'flexible',
      cleanliness: 3,
      noise: 'moderate',
      smoking: false,
      pets: false,
      cooking: 'sometimes'
    },
    interests: [] as string[],
    budget: {
      min: 0,
      max: 0
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        phone: user.phone || '',
        email: user.email,
        gender: (user as any).gender || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.put('/api/users/profile', profileData);
      toast.success('Đã cập nhật hồ sơ');
    } catch (error) {
      toast.error('Không thể cập nhật hồ sơ');
    }
  };

  const handleRoommateProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.put('/api/users/roommate-profile', roommateProfile);
      toast.success('Đã cập nhật hồ sơ tìm bạn cùng phòng');
    } catch (error) {
      toast.error('Không thể cập nhật hồ sơ');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Thông tin cơ bản
          </button>
          <button
            onClick={() => setActiveTab('roommate')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'roommate'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Hồ sơ tìm bạn cùng phòng
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="card p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Họ và tên</label>
              <input
                type="text"
                className="input"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="input"
                value={profileData.email}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Số điện thoại</label>
              <input
                type="tel"
                className="input"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Giới tính</label>
              <select
                className="input"
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              >
                <option value="">Không xác định</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              Lưu thay đổi
            </button>
          </form>
        )}

        {/* Roommate Profile Tab */}
        {activeTab === 'roommate' && (
          <form onSubmit={handleRoommateProfileUpdate} className="card p-6 space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={roommateProfile.lookingForRoommate}
                  onChange={(e) => setRoommateProfile({
                    ...roommateProfile,
                    lookingForRoommate: e.target.checked
                  })}
                />
                <span className="font-medium">Tôi đang tìm bạn cùng phòng</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Trường đại học</label>
                <input
                  type="text"
                  className="input"
                  value={roommateProfile.university}
                  onChange={(e) => setRoommateProfile({
                    ...roommateProfile,
                    university: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chuyên ngành</label>
                <input
                  type="text"
                  className="input"
                  value={roommateProfile.major}
                  onChange={(e) => setRoommateProfile({
                    ...roommateProfile,
                    major: e.target.value
                  })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Giới thiệu bản thân</label>
              <textarea
                rows={4}
                className="input"
                value={roommateProfile.bio}
                onChange={(e) => setRoommateProfile({
                  ...roommateProfile,
                  bio: e.target.value
                })}
                placeholder="Viết vài dòng về bản thân..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ngân sách tối thiểu (VNĐ/tháng)</label>
                <input
                  type="number"
                  className="input"
                  value={roommateProfile.budget.min || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRoommateProfile({
                      ...roommateProfile,
                      budget: { ...roommateProfile.budget, min: value ? Number(value) : 0 }
                    });
                  }}
                  placeholder="Nhập số tiền"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ngân sách tối đa (VNĐ/tháng)</label>
                <input
                  type="number"
                  className="input"
                  value={roommateProfile.budget.max || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRoommateProfile({
                      ...roommateProfile,
                      budget: { ...roommateProfile.budget, max: value ? Number(value) : 0 }
                    });
                  }}
                  placeholder="Nhập số tiền"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Lưu hồ sơ tìm bạn cùng phòng
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;








