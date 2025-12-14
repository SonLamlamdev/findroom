import React from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiUsers, FiShield, FiHeart, FiCheckCircle } from 'react-icons/fi';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Section */}
      <div className="bg-primary-600 dark:bg-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Về FindRoom</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-100">
            Hành trình kiến tạo không gian sống an toàn, tiện nghi và minh bạch dành cho sinh viên Việt Nam.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          
          {/* Our Story */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
              <FiHeart className="mr-2 text-red-500" />
              Câu chuyện của chúng tôi
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
              <p className="mb-4">
                Là những người từng trải qua quãng đời sinh viên, chúng tôi thấu hiểu sâu sắc nỗi vất vả khi đi tìm phòng trọ: 
                thông tin thiếu minh bạch, hình ảnh "treo đầu dê bán thịt chó", và đau đớn nhất là vấn nạn lừa đảo tiền cọc.
              </p>
              <p>
                FindRoom được thành lập với một mục tiêu duy nhất: <strong>Giải quyết triệt để những khó khăn đó.</strong> 
                Chúng tôi không chỉ xây dựng một trang web đăng tin, mà đang xây dựng một cộng đồng nơi niềm tin được đặt lên hàng đầu.
              </p>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <FiTarget className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Sứ mệnh</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Kết nối sinh viên với những chủ trọ uy tín thông qua công nghệ, tạo ra môi trường thuê phòng an toàn, 
                minh bạch và nhanh chóng nhất.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <FiUsers className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Tầm nhìn</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Trở thành nền tảng tìm kiếm nhà trọ số 1 dành cho sinh viên, nơi mà việc tìm chỗ ở dễ dàng như việc 
                lướt mạng xã hội.
              </p>
            </div>
          </section>

          {/* Core Values */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
              <FiShield className="mr-2 text-primary-600" />
              Cam kết của FindRoom
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Thông tin xác thực',
                  desc: 'Chúng tôi nỗ lực xác minh danh tính chủ trọ và kiểm duyệt tin đăng để loại bỏ tin rác.',
                },
                {
                  title: 'Hoàn toàn miễn phí',
                  desc: 'Miễn phí 100% trọn đời cho sinh viên tìm phòng. Không phí môi giới, không phí ẩn.',
                },
                {
                  title: 'Hỗ trợ tận tâm',
                  desc: 'Đội ngũ hỗ trợ luôn sẵn sàng lắng nghe và giải quyết các khiếu nại của người dùng.',
                }
              ].map((item, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <FiCheckCircle className="text-green-500 mb-2 text-xl" />
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Bạn đã sẵn sàng tìm nơi ở mới?
            </h3>
            <div className="flex justify-center gap-4">
              <Link to="/" className="btn-primary py-2 px-6 rounded-lg font-semibold">
                Xem danh sách phòng
              </Link>
              <Link to="/register" className="btn-secondary py-2 px-6 rounded-lg font-semibold">
                Đăng ký tài khoản
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;