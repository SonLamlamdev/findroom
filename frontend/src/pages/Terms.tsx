import React from 'react';
import { FiShield, FiAlertTriangle, FiCheckSquare, FiUserX, FiInfo } from 'react-icons/fi';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Điều khoản sử dụng</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cập nhật lần cuối: 14/12/2025
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm max-w-4xl mx-auto p-8 border border-gray-200 dark:border-gray-700">
          
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p className="lead text-lg mb-8">
              Chào mừng bạn đến với <strong>FindRoom</strong>. Khi truy cập và sử dụng nền tảng này, bạn đồng ý tuân thủ các điều khoản dưới đây. Vui lòng đọc kỹ để bảo vệ quyền lợi của chính mình.
            </p>

            {/* 1. Account */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiShield className="mr-2" />
                1. Tài khoản người dùng
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập (email, mật khẩu).</li>
                <li>Bạn phải cung cấp thông tin chính xác khi đăng ký (tên thật, số điện thoại liên lạc).</li>
                <li>Không được sử dụng tài khoản của người khác hoặc mạo danh bất kỳ cá nhân/tổ chức nào.</li>
              </ul>
            </section>

            {/* 2. Landlord Rules */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiCheckSquare className="mr-2" />
                2. Quy định đăng tin (Dành cho Chủ trọ)
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Hình ảnh thực tế:</strong> Hình ảnh phòng trọ phải là ảnh thật, không sử dụng ảnh minh họa lấy từ internet gây hiểu lầm.</li>
                <li><strong>Giá cả minh bạch:</strong> Phải niêm yết giá thuê chính xác, bao gồm cả giá điện, nước và các phí dịch vụ khác (nếu có).</li>
                <li><strong>Thông tin chính xác:</strong> Mô tả đúng hiện trạng phòng (diện tích, nội thất, tiện nghi).</li>
                <li>FindRoom có quyền từ chối hoặc xóa các tin đăng vi phạm, thiếu thông tin hoặc có dấu hiệu lừa đảo mà không cần báo trước.</li>
              </ul>
            </section>

            {/* 3. Prohibited Acts */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-red-500">
                <FiUserX className="mr-2" />
                3. Các hành vi bị nghiêm cấm
              </h2>
              <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
                <ul className="list-disc pl-5 space-y-2 text-red-700 dark:text-red-300">
                  <li>Yêu cầu người thuê chuyển khoản tiền cọc giữ phòng khi chưa cho xem phòng (Hành vi lừa đảo).</li>
                  <li>Sử dụng ngôn từ thiếu văn hóa, quấy rối hoặc đe dọa người dùng khác.</li>
                  <li>Đăng tải nội dung đồi trụy, chính trị hoặc vi phạm pháp luật Việt Nam.</li>
                  <li>Spam tin đăng hoặc tạo nhiều tài khoản ảo để thao túng đánh giá.</li>
                </ul>
              </div>
            </section>

            {/* 4. Disclaimer - IMPORTANT */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-yellow-600 dark:text-yellow-500">
                <FiAlertTriangle className="mr-2" />
                4. Miễn trừ trách nhiệm
              </h2>
              <p className="mb-4">
                FindRoom là nền tảng công nghệ trung gian kết nối người cho thuê và người cần thuê. Chúng tôi nỗ lực tối đa để xác thực danh tính (thông qua dấu tích xanh) và kiểm duyệt tin đăng, tuy nhiên:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>FindRoom <strong>không chịu trách nhiệm pháp lý</strong> đối với các giao dịch tiền bạc, hợp đồng thuê nhà diễn ra giữa Chủ trọ và Người thuê.</li>
                <li>Người thuê cần tự trang bị kiến thức, đến xem phòng trực tiếp và ký hợp đồng rõ ràng trước khi giao dịch tiền bạc.</li>
                <li>Chúng tôi không đảm bảo 100% tính chính xác của mọi tin đăng do người dùng tạo ra.</li>
              </ul>
            </section>

            {/* 5. Changes */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiInfo className="mr-2" />
                5. Điều khoản bổ sung
              </h2>
              <p>
                Chúng tôi có quyền thay đổi, chỉnh sửa các điều khoản này bất cứ lúc nào để phù hợp với tình hình thực tế. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;