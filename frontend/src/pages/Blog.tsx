import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import { FiHeart, FiMessageCircle, FiEye, FiPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, getAvatarUrl } from '../utils/imageHelper';
import { useTranslation } from 'react-i18next';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  customId?: string;
  rating?: number;
  author?: { // Made optional to prevent crashes
    name: string;
    avatar?: string;
  };
  likes: string[];
  comments: any[];
  views: number;
  createdAt: string;
  images: string[];
}

const Blog = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [allTags, setAllTags] = useState<string[]>([]);

  const categories = [
    { value: '', label: t('blog.all') },
    { value: 'tips', label: t('blog.categories.tips') },
    { value: 'experience', label: t('blog.categories.experience') },
    { value: 'checklist', label: t('blog.categories.checklist') },
    { value: 'scam-report', label: t('blog.categories.scamReport') },
    { value: 'discussion', label: t('blog.categories.discussion') }
  ];

  useEffect(() => {
    fetchPosts();
    fetchAllTags();
  }, [selectedCategory, searchQuery, selectedTag, sortBy]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedTag) params.append('tag', selectedTag);
      if (sortBy) params.append('sort', sortBy);

      const response = await axios.get(`/api/blogs?${params.toString()}`);
      setPosts(response.data.blogs);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    try {
      const response = await axios.get('/api/blogs');
      const allTagsSet = new Set<string>();
      response.data.blogs.forEach((blog: BlogPost) => {
        if (blog.tags) {
          blog.tags.forEach(tag => allTagsSet.add(tag));
        }
      });
      setAllTags(Array.from(allTagsSet));
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      tips: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      experience: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      checklist: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'scam-report': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      discussion: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[category] || colors.discussion;
  };

  const getCategoryLabel = (category: string) => {
    const keyMap: Record<string, string> = {
      'tips': 'tips',
      'experience': 'experience',
      'checklist': 'checklist',
      'scam-report': 'scamReport',
      'discussion': 'discussion'
    };
    return keyMap[category] ? t(`blog.categories.${keyMap[category]}`) : category;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('blog.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('blog.subtitle')}
          </p>
        </div>
        
        {user && (
          <Link to="/create-blog" className="btn-primary flex items-center">
            <FiPlus className="mr-2" />
            {t('blog.createButton')}
          </Link>
        )}
      </div>

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder={t('blog.searchPlaceholder')}
            className="input md:col-span-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchPosts()}
          />
          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-createdAt">{t('listings.sort.newest')}</option>
            <option value="createdAt">{t('listings.sort.newest').replace('Mới', 'Cũ').replace('Newest', 'Oldest')}</option>
            <option value="likes">Like (Popular)</option>
            <option value="views">View (High to Low)</option>
          </select>
          <button onClick={fetchPosts} className="btn-primary">
            {t('common.search')}
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category.value
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 self-center mr-2">{t('blog.tags')}</span>
            <button
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedTag === ''
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('blog.all')}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedTag === tag
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post._id}`}
              className="card overflow-hidden group"
            >
              {post.images && post.images[0] && (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <img
                    src={getImageUrl(post.images[0])}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeColor(post.category)}`}>
                    {getCategoryLabel(post.category)}
                  </span>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {post.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.content.substring(0, 150)}...
                </p>

                <div className="flex items-center justify-between text-sm">
                  {/* FIXED: Safe Navigation for Author */}
                  <div className="flex items-center">
                    <img
                      src={getAvatarUrl(post.author?.avatar)}
                      alt={post.author?.name || 'User'}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {post.author?.name || t('common.unknownUser', 'Người dùng ẩn')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-500">
                    <span className="flex items-center">
                      <FiHeart size={14} className="mr-1" />
                      {post.likes ? post.likes.length : 0}
                    </span>
                    <span className="flex items-center">
                      <FiMessageCircle size={14} className="mr-1" />
                      {post.comments ? post.comments.length : 0}
                    </span>
                    <span className="flex items-center">
                      <FiEye size={14} className="mr-1" />
                      {post.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('blog.noPosts')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Blog;