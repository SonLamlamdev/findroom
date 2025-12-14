import { useState, useEffect } from 'react';
import axios from '../config/axios';
import { FiUsers, FiHome, FiFileText, FiMap, FiAlertCircle, FiTrash2, FiXCircle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface Statistics {
  users: {
    total: number;
    landlords: number;
    tenants: number;
    banned: number;
  };
  listings: {
    total: number;
    active: number;
  };
  blogs: {
    total: number;
  };
  map: {
    annotations: number;
    floodReports: number;
  };
}

const AdminPanel = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'listings' | 'blogs' | 'annotations' | 'reports'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error(t('admin.noAccess'));
      return;
    }
    fetchStatistics();
    fetchData();
  }, [activeTab]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/admin/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          const usersRes = await axios.get('/api/admin/users');
          setUsers(usersRes.data.users);
          break;
        case 'listings':
          const listingsRes = await axios.get('/api/admin/listings');
          setListings(listingsRes.data.listings);
          break;
        case 'blogs':
          const blogsRes = await axios.get('/api/admin/blogs');
          setBlogs(blogsRes.data.blogs);
          break;
        case 'annotations':
          const annotationsRes = await axios.get('/api/admin/map-annotations');
          setAnnotations(annotationsRes.data.annotations);
          break;
        case 'reports':
          const reportsRes = await axios.get('/api/admin/flood-reports');
          setReports(reportsRes.data.reports);
          break;
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm(t('admin.confirm.ban'))) return;
    try {
      await axios.post(`/api/admin/users/${userId}/ban`, { reason: 'Vi phạm quy định' });
      toast.success(t('admin.actions.banSuccess'));
      fetchData();
      fetchStatistics();
    } catch (error) {
      toast.error(t('admin.actions.error'));
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await axios.post(`/api/admin/users/${userId}/unban`);
      toast.success(t('admin.actions.unbanSuccess'));
      fetchData();
      fetchStatistics();
    } catch (error) {
      toast.error(t('admin.actions.error'));
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(t('admin.confirm.delete'))) return;
    try {
      await axios.delete(`/api/admin/${type}/${id}`);
      toast.success(t('admin.actions.deleteSuccess'));
      fetchData();
      fetchStatistics();
    } catch (error) {
      toast.error(t('admin.actions.error'));
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">{t('admin.accessDeniedTitle')}</h2>
          <p>{t('admin.accessDeniedDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">{t('admin.title')}</h1>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('admin.stats.users')}</p>
                <p className="text-2xl font-bold">{statistics.users.total}</p>
              </div>
              <FiUsers size={32} className="text-primary-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('admin.stats.listings')}</p>
                <p className="text-2xl font-bold">{statistics.listings.total}</p>
              </div>
              <FiHome size={32} className="text-primary-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('admin.stats.blogs')}</p>
                <p className="text-2xl font-bold">{statistics.blogs.total}</p>
              </div>
              <FiFileText size={32} className="text-primary-600" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('admin.stats.banned')}</p>
                <p className="text-2xl font-bold">{statistics.users.banned}</p>
              </div>
              <FiXCircle size={32} className="text-red-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'users', label: t('admin.tabs.users'), icon: FiUsers },
            { id: 'listings', label: t('admin.tabs.listings'), icon: FiHome },
            { id: 'blogs', label: t('admin.tabs.blogs'), icon: FiFileText },
            { id: 'annotations', label: t('admin.tabs.annotations'), icon: FiMap },
            { id: 'reports', label: t('admin.tabs.reports'), icon: FiAlertCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="p-4 overflow-x-auto">
            {activeTab === 'users' && (
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3">{t('admin.table.name')}</th>
                    <th className="text-left p-3">{t('admin.table.email')}</th>
                    <th className="text-left p-3">{t('admin.table.role')}</th>
                    <th className="text-left p-3">{t('admin.table.status')}</th>
                    <th className="text-left p-3">{t('admin.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs bg-primary-100 dark:bg-primary-900">
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {user.isBanned ? (
                          <span className="text-red-600">{t('admin.status.banned')}</span>
                        ) : (
                          <span className="text-green-600">{t('admin.status.active')}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {user.isBanned ? (
                            <button
                              onClick={() => handleUnbanUser(user._id)}
                              className="text-green-600 hover:text-green-700"
                              title="Unban"
                            >
                              <FiCheck size={20} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user._id)}
                              className="text-red-600 hover:text-red-700"
                              title="Ban"
                            >
                              <FiXCircle size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete('users', user._id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'listings' && (
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3">{t('admin.table.title')}</th>
                    <th className="text-left p-3">{t('admin.table.landlord')}</th>
                    <th className="text-left p-3">{t('admin.table.price')}</th>
                    <th className="text-left p-3">{t('admin.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-3">{listing.title}</td>
                      <td className="p-3">{listing.landlord?.name}</td>
                      <td className="p-3">{listing.price?.toLocaleString()}đ</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete('listings', listing._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'blogs' && (
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3">{t('admin.table.title')}</th>
                    <th className="text-left p-3">{t('admin.table.author')}</th>
                    <th className="text-left p-3">{t('admin.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-3">{blog.title}</td>
                      <td className="p-3">{blog.author?.name}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete('blogs', blog._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'annotations' && (
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3">{t('admin.table.type')}</th>
                    <th className="text-left p-3">{t('admin.table.address')}</th>
                    <th className="text-left p-3">{t('admin.table.landlord')}</th>
                    <th className="text-left p-3">{t('admin.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {annotations.map((annotation) => (
                    <tr key={annotation._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-3">{annotation.type}</td>
                      <td className="p-3">{annotation.location?.address}</td>
                      <td className="p-3">{annotation.landlord?.name}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete('map-annotations', annotation._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'reports' && (
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3">{t('admin.table.level')}</th>
                    <th className="text-left p-3">{t('admin.table.desc')}</th>
                    <th className="text-left p-3">{t('admin.table.reporter')}</th>
                    <th className="text-left p-3">{t('admin.table.status')}</th>
                    <th className="text-left p-3">{t('admin.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-3">{report.level}</td>
                      <td className="p-3">{report.description}</td>
                      <td className="p-3">{report.user?.name}</td>
                      <td className="p-3">{report.status}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDelete('flood-reports', report._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;