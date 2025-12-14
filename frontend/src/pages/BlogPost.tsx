import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../config/axios';
import { FiHeart, FiMessageCircle, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl, getAvatarUrl } from '../utils/imageHelper';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  likes: string[];
  comments: Array<{
    user: {
      name: string;
      avatar?: string;
    };
    content: string;
    createdAt: string;
  }>;
  views: number;
  createdAt: string;
  images: string[];
}

const BlogPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLiked, setIsLiked] = useState(false); // State để lưu trạng thái tim
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/blogs/${id}`);
      setPost(response.data.blog);
    } catch (error) {
      toast.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      await axios.post(`/api/blogs/${id}/like`);
      // fetchPost(); XOA DONG NAY

      setIsLiked((prev) => !prev);

      setPost((prev) => {
        if (!prev) return null;

        const adjustment = isLiked ? -1 : 1;

        const newLikesLength = prev.likes.length + adjustment;

        return {
          ...prev,
          likes: Array(newLikesLength).fill("updated_locally")
        };
      });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');

      setIsLiked((prev) => !prev);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    if (!comment.trim()) return;

    try {
      await axios.post(`/api/blogs/${id}/comments`, { content: comment });
      setComment('');
      fetchPost();
      toast.success('Đã thêm bình luận');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600 dark:text-gray-400">Không tìm thấy bài viết</p>
      </div>
    );
  }

  // const isLiked = user && post.likes.includes(user.id); XOA DONG NAY

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <img
                src={getAvatarUrl(post.author.avatar)}
                alt={post.author.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{post.author.name}</p>
                <p className="text-sm">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : ''}`}
              >
                <FiHeart className={isLiked ? 'fill-current' : ''} />
                {post.likes.length}
              </button>
              <span className="flex items-center gap-1">
                <FiMessageCircle />
                {post.comments.length}
              </span>
              <span className="flex items-center gap-1">
                <FiEye />
                {post.views}
              </span>
            </div>
          </div>
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-8">
            <img
              src={getImageUrl(post.images[0])}
              alt={post.title}
              className="w-full rounded-xl"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none mb-12">
          <div className="whitespace-pre-line">{post.content}</div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-2xl font-bold mb-6">Bình luận ({post.comments.length})</h2>

          {/* Comment Form */}
          {user && (
            <form onSubmit={handleComment} className="mb-8">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="w-full input min-h-[100px] mb-3"
              />
              <button type="submit" className="btn-primary">
                Gửi bình luận
              </button>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {post.comments.map((comment, index) => (
              <div key={index} className="flex gap-3">
                <img
                  src={getAvatarUrl(comment.user.avatar)}
                  alt={comment.user.name}
                  className="w-10 h-10 rounded-full"
                />
                
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <p className="font-medium mb-1">{comment.user.name}</p>
                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {post.comments.length === 0 && (
            <p className="text-center text-gray-500 py-8">Chưa có bình luận nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;








