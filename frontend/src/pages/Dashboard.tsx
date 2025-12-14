import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { FiEye, FiHeart, FiDollarSign, FiTrendingUp, FiPlus } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTranslation } from 'react-i18next'; // Import Hook

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalSaves: number;
  priceComparison: {
    yourAverage: number;
    areaAverage: number;
    difference: number;
    percentageDiff: number;
  };
  topKeywords: Array<{ keyword: string; count: number }>;
  reviews: {
    total: number;
    averageRating: string;
    responseRate: string;
  };
}

const Dashboard = () => {
  const { t } = useTranslation(); // Initialize
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/dashboard/stats?period=${period}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        
        <div className="flex gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input"
          >
            <option value="week">{t('dashboard.period.week')}</option>
            <option value="month">{t('dashboard.period.month')}</option>
            <option value="year">{t('dashboard.period.year')}</option>
          </select>
          
          <Link to="/create-listing" className="btn-primary flex items-center">
            <FiPlus className="mr-2" />
            {t('dashboard.buttons.create')}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.stats.totalListings')}</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalListings || 0}</p>
              <p className="text-sm text-green-500 mt-1">
                {stats?.activeListings || 0} {t('dashboard.stats.activeListings')}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <FiEye className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.stats.views')}</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalViews || 0}</p>
              {/* Dynamic Period Text */}
              <p className="text-sm text-gray-500 mt-1">
                {period === 'week' ? t('dashboard.period.week') : 
                 period === 'month' ? t('dashboard.period.month') : 
                 t('dashboard.period.year')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <FiTrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.stats.saves')}</p>
              <p className="text-3xl font-bold mt-2">{stats?.totalSaves || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{t('dashboard.stats.savesDesc')}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <FiHeart className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.stats.rating')}</p>
              <p className="text-3xl font-bold mt-2">{stats?.reviews.averageRating || '0.0'}</p>
              <p className="text-sm text-gray-500 mt-1">{stats?.reviews.total || 0} {t('dashboard.stats.ratingCount')}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-2xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Price Comparison */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.priceAnalysis.title')}</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.priceAnalysis.yourAvg')}</span>
                <span className="font-bold text-primary-600">
                  {formatPrice(stats?.priceComparison.yourAverage || 0)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.priceAnalysis.areaAvg')}</span>
                <span className="font-bold">
                  {formatPrice(stats?.priceComparison.areaAverage || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.priceAnalysis.diff')}</span>
                <span className={`font-bold ${
                  (stats?.priceComparison.percentageDiff || 0) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {stats?.priceComparison.percentageDiff || 0}%
                </span>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {(stats?.priceComparison.percentageDiff || 0) > 10
                  ? t('dashboard.priceAnalysis.high')
                  : (stats?.priceComparison.percentageDiff || 0) < -10
                  ? t('dashboard.priceAnalysis.low')
                  : t('dashboard.priceAnalysis.ok')}
              </p>
            </div>
          </div>
        </div>

        {/* Top Keywords */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">{t('dashboard.keywords.title')}</h2>
          
          <div className="space-y-3">
            {stats?.topKeywords.slice(0, 8).map((keyword, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{keyword.keyword}</span>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3">
                    <div
                      className="h-full bg-primary-600 rounded-full"
                      style={{
                        width: `${Math.min((keyword.count / (stats?.topKeywords[0]?.count || 1)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                    {keyword.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {(!stats?.topKeywords || stats.topKeywords.length === 0) && (
            <p className="text-gray-500 text-center py-4">
              {t('dashboard.keywords.empty')}
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card p-6 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600">
        <h3 className="font-bold text-lg mb-2">{t('dashboard.tips.title')}</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>{t('dashboard.tips.l1')}</li>
          <li>{t('dashboard.tips.l2')}</li>
          <li>{t('dashboard.tips.l3')}</li>
          <li>{t('dashboard.tips.l4')}</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;