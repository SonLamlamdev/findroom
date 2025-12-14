import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiUser, FiHome, FiHelpCircle } from 'react-icons/fi';

const FAQItem = ({ question, answer, isOpen, onClick }: any) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 overflow-hidden bg-white dark:bg-gray-800 transition-all">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={onClick}
      >
        <span className="font-semibold text-gray-800 dark:text-gray-200">{question}</span>
        {isOpen ? <FiChevronUp className="text-primary-600" /> : <FiChevronDown className="text-gray-400" />}
      </button>
      
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [activeTab, setActiveTab] = useState<'tenant' | 'landlord'>('tenant');
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first item by default

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const tenantFAQs = [
    {
      q: "Tìm phòng trên FindRoom có mất phí không?",
      a: "Hoàn toàn miễn phí! FindRoom cam kết không thu bất kỳ khoản phí môi giới nào từ sinh viên/người đi thuê phòng."
    },
    {
      q: "Làm sao để tránh bị lừa đảo khi thuê phòng?",
      a: "Tuyệt đối KHÔNG chuyển tiền cọc khi chưa đến xem phòng trực tiếp và gặp chủ trọ. Hãy ưu tiên các tin đăng từ chủ trọ có tích xanh (Đã xác thực) và luôn ký hợp đồng thuê rõ ràng."
    },
    {
      q: "Tôi có thể hủy lịch hẹn xem phòng không?",
      a: "Có. Nếu bạn bận, vui lòng vào phần 'Quản lý lịch hẹn' để hủy hoặc nhắn tin báo cho chủ trọ biết. Điều này giúp giữ uy tín cho tài khoản của bạn."
    },
    {
      q: "Chức năng 'Lưu tin' dùng để làm gì?",
      a: "Giúp bạn lưu lại những căn phòng ưng ý để dễ dàng so sánh giá cả và vị trí trước khi đưa ra quyết định cuối cùng."
    }
  ];

  const landlordFAQs = [
    {
      q: "Đăng tin cho thuê có mất phí không?",
      a: "Hiện tại FindRoom đang hỗ trợ miễn phí đăng tin cho tất cả chủ trọ để xây dựng cộng đồng. Trong tương lai có thể sẽ có các gói dịch vụ cao cấp (đẩy tin, tin nổi bật) có phí."
    },
    {
      q: "Làm sao để tin đăng của tôi được nhiều người xem?",
      a: "Hình ảnh đẹp, sáng sủa và thông tin chi tiết là chìa khóa. Hãy điền đầy đủ giá điện, nước, tiện nghi và mô tả kỹ về an ninh khu vực."
    },
    {
      q: "Làm thế nào để được cấp tích xanh 'Chủ trọ xác thực'?",
      a: "Bạn cần cập nhật hồ sơ cá nhân và tải lên ảnh CCCD/CMND để hệ thống xác minh. Chủ trọ có tích xanh thường được người thuê tin tưởng hơn gấp 3 lần."
    },
    {
      q: "Tôi có thể ẩn tin khi phòng đã cho thuê không?",
      a: "Được. Bạn vào phần 'Quản lý tin đăng' và chuyển trạng thái tin sang 'Đã ẩn' hoặc 'Đã cho thuê' để không bị làm phiền."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Header */}
      <div className="bg-primary-600 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <FiHelpCircle className="mx-auto text-5xl mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-2">Câu hỏi thường gặp</h1>
          <p className="text-primary-100 max-w-xl mx-auto">
            Chúng tôi ở đây để giải đáp mọi thắc mắc của bạn về quá trình tìm phòng và cho thuê.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-3xl mx-auto overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => { setActiveTab('tenant'); setOpenIndex(0); }}
              className={`flex-1 py-4 text-center font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'tenant' 
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <FiUser /> Cho Người Thuê
            </button>
            <button
              onClick={() => { setActiveTab('landlord'); setOpenIndex(0); }}
              className={`flex-1 py-4 text-center font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'landlord' 
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <FiHome /> Cho Chủ Trọ
            </button>
          </div>

          {/* FAQ List */}
          <div className="p-6 md:p-8 min-h-[400px]">
            {activeTab === 'tenant' ? (
              <div className="animate-fadeIn">
                {tenantFAQs.map((item, index) => (
                  <FAQItem
                    key={index}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === index}
                    onClick={() => toggleItem(index)}
                  />
                ))}
              </div>
            ) : (
              <div className="animate-fadeIn">
                {landlordFAQs.map((item, index) => (
                  <FAQItem
                    key={index}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === index}
                    onClick={() => toggleItem(index)}
                  />
                ))}
              </div>
            )}

            <div className="mt-8 text-center bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                Vẫn chưa tìm thấy câu trả lời?
              </p>
              <a href="mailto:support@findroom.vn" className="text-primary-600 font-bold hover:underline">
                Liên hệ bộ phận hỗ trợ
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FAQ;