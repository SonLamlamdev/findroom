import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'discussion',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'tips', label: 'Mẹo hay' },
    { value: 'experience', label: 'Kinh nghiệm' },
    { value: 'checklist', label: 'Checklist xem phòng' },
    { value: 'scam-report', label: 'Cảnh báo lừa đảo' },
    { value: 'discussion', label: 'Thảo luận' }
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

      toast.success('Đã đăng bài viết');
      navigate(`/blog/${response.data.blog._id}`);
    } catch (error) {
      toast.error('Không thể đăng bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Viết bài mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
            <input
              type="text"
              required
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nhập tiêu đề bài viết..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Danh mục *</label>
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
            <label className="block text-sm font-medium mb-2">Nội dung *</label>
            <textarea
              required
              rows={15}
              className="input"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Viết nội dung bài viết..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <input
              type="text"
              className="input"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Nhập tags, cách nhau bằng dấu phẩy (vd: sinh viên, trọ, mẹo hay)"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Đang đăng...' : 'Đăng bài'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/blog')}
              className="btn-secondary"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;








