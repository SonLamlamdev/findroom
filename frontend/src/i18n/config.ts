import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      nav: {
        home: 'Trang chủ',
        listings: 'Danh sách phòng',
        map: 'Bản đồ',
        roommate: 'Tìm bạn cùng phòng',
        blog: 'Blog & Cộng đồng',
        dashboard: 'Quản lý',
        profile: 'Hồ sơ',
        saved: 'Đã lưu',
        login: 'Đăng nhập',
        register: 'Đăng ký',
        logout: 'Đăng xuất'
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
        rented: 'Đã cho thuê'
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
        roommate: 'Find Roommate',
        blog: 'Blog & Community',
        dashboard: 'Dashboard',
        profile: 'Profile',
        saved: 'Saved',
        login: 'Login',
        register: 'Register',
        logout: 'Logout'
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
        rented: 'Rented'
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
    lng: 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;








