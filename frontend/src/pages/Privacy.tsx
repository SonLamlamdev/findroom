import React from 'react';
import { FiLock, FiEye, FiDatabase, FiShare2, FiTrash2 } from 'react-icons/fi';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Header - UPDATED to Blue Stripe */}
      <div className="bg-primary-600 dark:bg-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Chính sách bảo mật</h1>
          <p className="text-primary-100 text-xl max-w-2xl mx-auto">
            Cam kết bảo vệ thông tin cá nhân của bạn
          </p>
        </div>
      </div>

      {/* Content Container - Added negative margin (-mt-8) for the floating card effect */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-4xl mx-auto p-8 border border-gray-200 dark:border-gray-700">
          
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p className="mb-8">
              Tại <strong>FindRoom</strong>, chúng tôi hiểu rằng quyền riêng tư là vô cùng quan trọng. Chính sách này mô tả chi tiết cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng nền tảng.
            </p>

            {/* 1. Data Collection */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiDatabase className="mr-2" />
                1. Dữ liệu chúng tôi thu thập
              </h2>
              <p className="mb-2">Chúng tôi chỉ thu thập những thông tin cần thiết để vận hành dịch vụ:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Thông tin định danh:</strong> Họ tên, địa chỉ email, số điện thoại, và ảnh đại diện (avatar).</li>
                <li><strong>Thông tin xác thực (dành cho Chủ trọ):</strong> Ảnh CCCD/CMND (chỉ dùng để xác minh danh tính, không hiển thị công khai).</li>
                <li><strong>Dữ liệu hoạt động:</strong> Lịch sử xem phòng, các phòng đã lưu, và lịch sử đánh giá.</li>
              </ul>
            </section>

            {/* 2. Usage */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-green-600 dark:text-green-400">
                <FiEye className="mr-2" />
                2. Phạm vi sử dụng thông tin
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Kết nối liên lạc:</strong> Số điện thoại của bạn chỉ hiển thị cho người dùng khác khi có nhu cầu thuê/cho thuê thực sự (ví dụ: khi bấm "Hiện số điện thoại").</li>
                <li><strong>Xác thực tài khoản:</strong> Đảm bảo môi trường an toàn, loại bỏ các tài khoản ảo hoặc lừa đảo.</li>
                <li><strong>Gửi thông báo:</strong> Email được dùng để gửi xác nhận đặt lịch xem phòng, quên mật khẩu, hoặc thông báo hệ thống quan trọng.</li>
              </ul>
            </section>

            {/* 3. Sharing */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-blue-500">
                <FiShare2 className="mr-2" />
                3. Chia sẻ thông tin
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <p className="font-semibold mb-2 text-blue-800 dark:text-blue-300">Cam kết 3 KHÔNG:</p>
                <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300">
                  <li>KHÔNG bán dữ liệu cá nhân cho bên thứ ba.</li>
                  <li>KHÔNG chia sẻ thông tin cho các công ty quảng cáo/tiếp thị.</li>
                  <li>KHÔNG công khai thông tin nhạy cảm (như CCCD) lên website.</li>
                </ul>
              </div>
            </section>

            {/* 4. Security */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiLock className="mr-2" />
                4. Bảo mật dữ liệu
              </h2>
              <p>
                Mọi thông tin cá nhân được lưu trữ trên máy chủ bảo mật. Mật khẩu của người dùng được mã hóa một chiều (Hashing) trước khi lưu vào cơ sở dữ liệu, đảm bảo ngay cả nhân viên của FindRoom cũng không thể biết mật khẩu của bạn.
              </p>
            </section>

            {/* 5. User Rights */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-red-500">
                <FiTrash2 className="mr-2" />
                5. Quyền của người dùng
              </h2>
              <p className="mb-2">Bạn có toàn quyền kiểm soát dữ liệu của mình:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Chỉnh sửa:</strong> Bạn có thể cập nhật thông tin cá nhân bất cứ lúc nào trong trang "Hồ sơ".</li>
                <li><strong>Xóa tài khoản:</strong> Bạn có quyền yêu cầu xóa vĩnh viễn tài khoản và toàn bộ dữ liệu liên quan khỏi hệ thống của chúng tôi bằng cách liên hệ với đội ngũ hỗ trợ.</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;