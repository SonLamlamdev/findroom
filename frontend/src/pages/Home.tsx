import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiMap, FiUsers, FiShield, FiMessageSquare } from 'react-icons/fi';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
  };

  const features = [
    {
      icon: <FiMap size={40} />,
      title: t('home.features.map'),
      description: t('home.features.mapDesc'),
      color: 'bg-blue-500'
    },
    {
      icon: <FiUsers size={40} />,
      title: t('home.features.roommate'),
      description: t('home.features.roommateDesc'),
      color: 'bg-green-500'
    },
    {
      icon: <FiShield size={40} />,
      title: t('home.features.verified'),
      description: t('home.features.verifiedDesc'),
      color: 'bg-purple-500'
    },
    {
      icon: <FiMessageSquare size={40} />,
      title: t('home.features.community'),
      description: t('home.features.communityDesc'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              {t('home.hero.subtitle')}
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
                <FiSearch className="ml-6 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder={t('home.hero.searchPlaceholder')}
                  className="flex-1 px-4 py-4 text-gray-900 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 font-semibold transition-colors"
                >
                  {t('home.hero.searchButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t('home.features.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card p-6 text-center">
              <div className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section - UPDATED */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600 dark:text-gray-400">{t('home.stats.rooms')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">{t('home.stats.landlords')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">5000+</div>
              <div className="text-gray-600 dark:text-gray-400">{t('home.stats.students')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600 dark:text-gray-400">{t('home.stats.unis')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - UPDATED */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/listings')}
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('home.cta.viewListings')}
            </button>
            <button
              onClick={() => navigate('/map')}
              className="bg-primary-800 hover:bg-primary-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('home.cta.viewMap')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;