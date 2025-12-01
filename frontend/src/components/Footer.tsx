import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">FindRoom</h3>
            <p className="text-sm mb-4">
              Nền tảng tìm trọ thông minh dành riêng cho sinh viên. 
              Kết nối người cho thuê và người tìm trọ một cách hiệu quả và an toàn.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="hover:text-primary-400">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="hover:text-primary-400">
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/listings" className="hover:text-primary-400">Danh sách phòng</Link></li>
              <li><Link to="/map" className="hover:text-primary-400">Bản đồ</Link></li>
              <li><Link to="/roommate-finder" className="hover:text-primary-400">Tìm bạn cùng phòng</Link></li>
              <li><Link to="/blog" className="hover:text-primary-400">Blog & Cộng đồng</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary-400">Về chúng tôi</Link></li>
              <li><Link to="/terms" className="hover:text-primary-400">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-400">Chính sách bảo mật</Link></li>
              <li><Link to="/faq" className="hover:text-primary-400">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <FiMapPin className="mr-2" />
                Hà Nội, Việt Nam
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2" />
                +84 123 456 789
              </li>
              <li className="flex items-center">
                <FiMail className="mr-2" />
                support@findroom.vn
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} FindRoom. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;








