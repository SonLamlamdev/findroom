import { useState, useEffect } from 'react';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  // 1. Get setUser from AuthContext to update global state instantly
  const { user, setUser } = useAuth(); 
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
      // Load existing roommate profile if available
      if ((user as any).roommateProfile) {
         setRoommateProfile({ ...roommateProfile, ...(user as any).roommateProfile });
      }
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 2. Capture the response
      const response = await axios.put('/api/users/profile', profileData);
      
      // 3. Update Global Auth State immediately (No reload needed!)
      // Ensure your backend returns the updated user object in response.data.user
      if (response.data.user && setUser) {
        setUser(response.data.user);
      }
      
      toast.success(t('profile.success'));
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    }
  };

  const handleRoommateProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.put('/api/users/roommate-profile', roommateProfile);
      
      // Update Global State for this too
      if (response.data.user && setUser) {
        setUser(response.data.user);
      }

      toast.success(t('profile.success'));
    } catch (error) {
      console.error(error);
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('profile.title')}</h1>

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
            {t('profile.tabs.basic')}
          </button>
          <button
            onClick={() => setActiveTab('roommate')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'roommate'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {t('profile.tabs.roommate')}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate} className="card p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.labels.name')}</label>
              <input
                type="text"
                className="input"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.labels.email')}</label>
              <input
                type="email"
                className="input"
                value={profileData.email}
                disabled
                className="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.labels.phone')}</label>
              <input
                type="tel"
                className="input"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('profile.labels.gender')}</label>
              <select
                className="input"
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              >
                <option value="">{t('profile.genders.unknown')}</option>
                <option value="male">{t('profile.genders.male')}</option>
                <option value="female">{t('profile.genders.female')}</option>
                <option value="other">{t('profile.genders.other')}</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              {t('profile.buttons.save')}
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
                  className="mr-2 w-5 h-5 text-primary-600 rounded"
                  checked={roommateProfile.lookingForRoommate}
                  onChange={(e) => setRoommateProfile({
                    ...roommateProfile,
                    lookingForRoommate: e.target.checked
                  })}
                />
                <span className="font-medium">{t('profile.labels.looking')}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('profile.labels.uni')}</label>
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
                <label className="block text-sm font-medium mb-2">{t('profile.labels.major')}</label>
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
              <label className="block text-sm font-medium mb-2">{t('profile.labels.bio')}</label>
              <textarea
                rows={4}
                className="input"
                value={roommateProfile.bio}
                onChange={(e) => setRoommateProfile({
                  ...roommateProfile,
                  bio: e.target.value
                })}
                placeholder={t('profile.labels.bioPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('profile.labels.minBudget')}</label>
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
                  placeholder={t('profile.labels.enterAmount')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('profile.labels.maxBudget')}</label>
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
                  placeholder={t('profile.labels.enterAmount')}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              {t('profile.buttons.saveRoommate')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;