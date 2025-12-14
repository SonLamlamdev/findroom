import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      nav: {
        home: 'Trang chủ',
        listings: 'Danh sách phòng',
        map: 'Bản đồ',
        roommate: 'Tìm bạn ở ghép',
        blog: 'Blog & Cộng đồng',
        dashboard: 'Bảng điều khiển', // Changed from "Quản lý" to match new context
        stats: 'Thống kê', // New
        post: 'Đăng bài', // New
        profile: 'Hồ sơ',
        saved: 'Tin đã lưu',
        savedRoommates: 'Hồ sơ ở ghép đã lưu', // New
        messages: 'Tin nhắn', // New
        stayed: 'Phòng đã ở', // New
        admin: 'Quản trị', // New
        login: 'Đăng nhập',
        register: 'Đăng ký',
        logout: 'Đăng xuất'
      },
      footer: { // --- NEW SECTION ---
        description: "Nền tảng tìm trọ thông minh dành riêng cho sinh viên. Kết nối người cho thuê và người tìm trọ một cách hiệu quả và an toàn.",
        about: "Về chúng tôi",
        terms: "Điều khoản sử dụng",
        privacy: "Chính sách bảo mật",
        faq: "Câu hỏi thường gặp",
        support: "Hỗ trợ",
        contact: "Liên hệ",
        quickLinks: "Liên kết nhanh"
      },
      common: {
        search: 'Tìm kiếm',
        filter: 'Lọc',
        submit: 'Gửi',
        cancel: 'Hủy',
        save: 'Lưu',
        edit: 'Chỉnh sửa',
        delete: 'Xóa',
        viewDetails: 'Xem chi tiết',
        loadMore: 'Xem thêm',
        price: 'Giá',
        location: 'Vị trí',
        area: 'Diện tích',
        available: 'Còn trống',
        rented: 'Đã cho thuê',
        loading: "Đang tải...", // New
        error: "Có lỗi xảy ra", // New
        success: "Thành công"   // New
      },
      home: {
        hero: {
          title: 'Tìm trọ thông minh cho sinh viên',
          subtitle: 'Nền tảng tìm kiếm phòng trọ hiện đại với bản đồ tương tác và gợi ý bạn cùng phòng',
          searchPlaceholder: 'Nhập địa chỉ hoặc tên trường đại học...',
          searchButton: 'Tìm kiếm'
        },
        features: {
          title: 'Tính năng nổi bật',
          map: 'Bản đồ tương tác',
          mapDesc: 'Xem giá thuê, an ninh, tiện ích và rủi ro ngập lụt trên bản đồ',
          roommate: 'Tìm bạn cùng phòng',
          roommateDesc: 'Gợi ý bạn cùng phòng tương thích cao dựa trên thói quen và sở thích',
          verified: 'Chủ trọ uy tín',
          verifiedDesc: 'Hệ thống đánh giá và xác thực chủ trọ',
          community: 'Cộng đồng',
          communityDesc: 'Chia sẻ kinh nghiệm và mẹo sống trọ'
        }
      },
      auth: {
        login: 'Đăng nhập',
        register: 'Đăng ký',
        email: 'Email',
        password: 'Mật khẩu',
        name: 'Họ và tên',
        phone: 'Số điện thoại',
        role: 'Vai trò',
        tenant: 'Người thuê',
        landlord: 'Chủ trọ',
        forgotPassword: 'Quên mật khẩu?',
        noAccount: 'Chưa có tài khoản?',
        haveAccount: 'Đã có tài khoản?'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        listings: 'Listings',
        map: 'Map',
        roommate: 'Roommate Finder',
        blog: 'Blog & Community',
        dashboard: 'Dashboard',
        stats: 'Statistics', // New
        post: 'Post Listing', // New
        profile: 'Profile',
        saved: 'Saved Listings',
        savedRoommates: 'Saved Roommates', // New
        messages: 'Messages', // New
        stayed: 'Stayed History', // New
        admin: 'Admin Panel', // New
        login: 'Login',
        register: 'Register',
        logout: 'Logout'
      },
      footer: { // --- NEW SECTION ---
        description: "Smart accommodation platform exclusively for students. Connecting landlords and tenants effectively and safely.",
        about: "About Us",
        terms: "Terms of Use",
        privacy: "Privacy Policy",
        faq: "FAQ",
        support: "Support",
        contact: "Contact",
        quickLinks: "Quick Links"
      },
      common: {
        search: 'Search',
        filter: 'Filter',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        viewDetails: 'View Details',
        loadMore: 'Load More',
        price: 'Price',
        location: 'Location',
        area: 'Area',
        available: 'Available',
        rented: 'Rented',
        loading: "Loading...", // New
        error: "Error occurred", // New
        success: "Success" // New
      },
      home: {
        hero: {
          title: 'Smart Student Accommodation Finder',
          subtitle: 'Modern platform for finding rooms with interactive maps and roommate matching',
          searchPlaceholder: 'Enter address or university name...',
          searchButton: 'Search'
        },
        features: {
          title: 'Key Features',
          map: 'Interactive Map',
          mapDesc: 'View rental prices, security, amenities and flood risks on map',
          roommate: 'Find Roommate',
          roommateDesc: 'Get highly compatible roommate suggestions based on habits and interests',
          verified: 'Verified Landlords',
          verifiedDesc: 'Rating and verification system for landlords',
          community: 'Community',
          communityDesc: 'Share experiences and living tips'
        }
      },
      auth: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        name: 'Full Name',
        phone: 'Phone Number',
        role: 'Role',
        tenant: 'Tenant',
        landlord: 'Landlord',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        haveAccount: 'Already have an account?'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Default to Vietnamese if detection fails
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Saves the choice so it persists on refresh
    }
  });

export default i18n;