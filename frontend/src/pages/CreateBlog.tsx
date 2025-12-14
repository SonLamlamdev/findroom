import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // Import Hook

const CreateBlog = () => {
  const { t } = useTranslation(); // Initialize
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'discussion',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'tips', label: t('blog.categories.tips') },
    { value: 'experience', label: t('blog.categories.experience') },
    { value: 'checklist', label: t('blog.categories.checklist') },
    { value: 'scam-report', label: t('blog.categories.scamReport') },
    { value: 'discussion', label: t('blog.categories.discussion') }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await axios.post('/api/blogs', {
        ...formData,
        tags
      });

      toast.success(t('blog.create.success'));
      navigate(`/blog/${response.data.blog._id}`);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('blog.create.pageTitle')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t('blog.create.titleLabel')}</label>
            <input
              type="text"
              required
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('blog.create.titlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('blog.create.categoryLabel')}</label>
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('blog.create.contentLabel')}</label>
            <textarea
              required
              rows={15}
              className="input"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={t('blog.create.contentPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('blog.create.tagsLabel')}</label>
            <input
              type="text"
              className="input"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder={t('blog.create.tagsPlaceholder')}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? t('blog.create.submitting') : t('blog.create.submit')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="btn-secondary"
            >
              {t('blog.create.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;