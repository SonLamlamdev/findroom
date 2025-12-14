import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  vi: {
    translation: {
      nav: {
        home: 'Trang chủ',
        listings: 'Danh sách phòng',
        map: 'Bản đồ',
        roommate: 'Tìm bạn ở ghép',
        blog: 'Blog & Cộng đồng',
        dashboard: 'Bảng điều khiển',
        stats: 'Thống kê',
        post: 'Đăng bài',
        profile: 'Hồ sơ',
        saved: 'Tin đã lưu',
        savedRoommates: 'Hồ sơ ở ghép đã lưu',
        messages: 'Tin nhắn',
        stayed: 'Phòng đã ở',
        admin: 'Quản trị',
        login: 'Đăng nhập',
        register: 'Đăng ký',
        logout: 'Đăng xuất'
      },
      footer: {
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
        loading: "Đang tải...",
        error: "Có lỗi xảy ra",
        success: "Thành công"
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
      },
      listings: {
        title: "Danh sách phòng trọ",
        searchPlaceholder: "Tìm theo khu vực, tên đường...",
        filters: {
          priceRange: "Khoảng giá",
          roomType: "Loại phòng",
          amenities: "Tiện nghi",
          district: "Quận/Huyện",
          minPrice: "Giá thấp nhất",
          maxPrice: "Giá cao nhất"
        },
        sort: {
          label: "Sắp xếp",
          newest: "Mới nhất",
          priceLowHigh: "Giá: Thấp đến Cao",
          priceHighLow: "Giá: Cao đến Thấp",
          rating: "Đánh giá cao nhất"
        },
        noResults: "Không tìm thấy phòng phù hợp."
      },
      map: {
        searchLocation: "Nhập địa điểm để tìm...",
        showList: "Hiện danh sách",
        hideList: "Ẩn danh sách",
        myLocation: "Vị trí của tôi",
        filters: {
          title: "Bộ lọc",
          layer: "Lớp dữ liệu",
          priceLayer: "💰 Giá thuê",
          floodLayer: "🌊 Ngập lụt",
          priceRange: "Khoảng giá",
          min: "Tối thiểu",
          max: "Tối đa",
          roomType: "Loại phòng",
          all: "Tất cả"
        },
        legend: {
          title: "Chú thích",
          lowPrice: "Giá thấp (< 2tr)",
          medPrice: "Giá trung bình (2-4tr)",
          highPrice: "Giá cao (> 4tr)",
          floodLow: "Ngập nhẹ (Mắt cá)",
          floodMed: "Ngập vừa (Đầu gối)",
          floodHigh: "Ngập nặng (Yên xe)"
        },
        flood: {
          button: "Báo ngập lụt",
          modalTitle: "Báo cáo ngập lụt",
          level: "Mức độ ngập",
          depth: "Độ sâu ngập",
          desc: "Mô tả",
          address: "Địa chỉ",
          image: "Hình ảnh (khuyến khích)",
          submit: "Gửi báo cáo",
          submitting: "Đang gửi...",
          resolve: "Xác nhận đã rút nước",
          levels: {
            low: "Thấp",
            medium: "Trung bình",
            high: "Cao",
            ankle: "Mắt cá chân (5-10cm)",
            knee: "Đầu gối (30-50cm)",
            bike: "Yên xe máy (50-80cm)"
          }
        }
      },
      create: {
        pageTitle: "Đăng tin cho thuê phòng trọ",
        pageSubtitle: "Giống như đăng bài Facebook - Dễ dàng và nhanh chóng! ✨",
        sections: {
          media: "📸 Ảnh & Video",
          basicInfo: "📝 Thông tin cơ bản",
          location: "📍 Vị trí trên bản đồ",
          amenities: "✨ Tiện nghi",
          rules: "📋 Nội quy"
        },
        labels: {
          upload: "Click để chọn ảnh/video",
          uploadLimit: "Tối đa 10 file, mỗi file không quá 10MB",
          title: "Tiêu đề bài đăng *",
          titlePlaceholder: "VD: Phòng trọ đẹp gần ĐH Bách Khoa...",
          description: "Mô tả chi tiết *",
          descriptionPlaceholder: "Mô tả chi tiết về phòng trọ...",
          price: "Giá thuê (VNĐ/tháng) *",
          deposit: "Tiền cọc (VNĐ)",
          area: "Diện tích (m²) *",
          capacity: "Số người *",
          bedrooms: "Phòng ngủ",
          bathrooms: "Phòng tắm",
          roomType: "Loại phòng *",
          address: "Địa chỉ chi tiết *",
          district: "Quận/Huyện *",
          city: "Thành phố",
          rulesPlaceholder: "VD: Không hút thuốc, giờ giấc tự do..."
        },
        roomTypes: {
          single: "Phòng đơn",
          shared: "Phòng ghép",
          apartment: "Căn hộ",
          house: "Nhà nguyên căn"
        },
        amenities: {
          ac: "Điều hòa",
          heater: "Nóng lạnh",
          fridge: "Tủ lạnh",
          washer: "Máy giặt",
          wifi: "Wifi",
          parking: "Bãi đỗ xe",
          elevator: "Thang máy",
          security: "An ninh 24/7",
          kitchen: "Cho phép nấu ăn",
          school: "Gần trường",
          market: "Gần chợ",
          hospital: "Gần bệnh viện"
        },
        buttons: {
          submit: "🚀 Đăng tin ngay",
          submitting: "⏳ Đang đăng tin...",
          cancel: "Hủy"
        },
        errors: {
          maxFiles: "Tối đa 10 ảnh/video",
          fileSize: "Kích thước file không được vượt quá 10MB",
          location: "Vui lòng chọn vị trí trên bản đồ",
          minImage: "Vui lòng thêm ít nhất 1 ảnh",
          success: "Đã đăng tin thành công! 🎉"
        }
      },
      // --- NEW SECTION FOR LISTING DETAIL ---
      listingDetail: {
        notFound: "Không tìm thấy phòng",
        description: "Mô tả",
        amenities: "Tiện nghi",
        rules: "Nội quy",
        reviews: {
          title: "Đánh giá",
          writeButton: "Viết đánh giá",
          ratingLabel: "Đánh giá (sao)",
          commentLabel: "Bình luận",
          commentPlaceholder: "Chia sẻ trải nghiệm của bạn...",
          submit: "Gửi đánh giá",
          cancel: "Hủy",
          empty: "Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!",
          success: "Đánh giá thành công!"
        },
        landlord: {
          info: "Thông tin chủ trọ",
          verified: "Uy tín",
          phone: "SĐT"
        },
        buttons: {
          message: "Nhắn tin cho chủ trọ",
          save: "Lưu tin",
          saved: "Đã lưu",
          markStayed: "Đánh dấu đã ở",
          markedStayed: "Bạn đã đánh dấu phòng này là đã ở"
        },
        stayed: {
          dateLabel: "Ngày đã ở",
          hint: "Đánh dấu phòng là \"đã ở\" để có thể đánh giá"
        },
        price: {
          perMonth: "/tháng",
          deposit: "Đặt cọc"
        },
        capacity: "người",
        errors: {
          loginToSave: "Vui lòng đăng nhập để lưu phòng",
          loginToReview: "Vui lòng đăng nhập",
          mustStay: "Bạn phải đánh dấu phòng là \"đã ở\" trước khi đánh giá",
          noComment: "Vui lòng nhập bình luận",
          noDate: "Vui lòng chọn ngày đã ở",
          markSuccess: "Đã đánh dấu phòng là đã ở"
        }
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
        stats: 'Statistics',
        post: 'Post Listing',
        profile: 'Profile',
        saved: 'Saved Listings',
        savedRoommates: 'Saved Roommates',
        messages: 'Messages',
        stayed: 'Stayed History',
        admin: 'Admin Panel',
        login: 'Login',
        register: 'Register',
        logout: 'Logout'
      },
      footer: {
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
        loading: "Loading...",
        error: "Error occurred",
        success: "Success"
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
      },
      listings: {
        title: "Rental Listings",
        searchPlaceholder: "Search by area, street name...",
        filters: {
          priceRange: "Price Range",
          roomType: "Room Type",
          amenities: "Amenities",
          district: "District",
          minPrice: "Min Price",
          maxPrice: "Max Price"
        },
        sort: {
          label: "Sort by",
          newest: "Newest",
          priceLowHigh: "Price: Low to High",
          priceHighLow: "Price: High to Low",
          rating: "Highest Rated"
        },
        noResults: "No suitable rooms found."
      },
      map: {
        searchLocation: "Enter location to search...",
        showList: "Show List",
        hideList: "Hide List",
        myLocation: "My Location",
        filters: {
          title: "Filters",
          layer: "Data Layer",
          priceLayer: "💰 Rental Price",
          floodLayer: "🌊 Flood Risk",
          priceRange: "Price Range",
          min: "Min",
          max: "Max",
          roomType: "Room Type",
          all: "All"
        },
        legend: {
          title: "Legend",
          lowPrice: "Low Price (< 2M)",
          medPrice: "Medium Price (2-4M)",
          highPrice: "High Price (> 4M)",
          floodLow: "Low Flood (Ankle)",
          floodMed: "Med Flood (Knee)",
          floodHigh: "High Flood (Bike Seat)"
        },
        flood: {
          button: "Report Flood",
          modalTitle: "Flood Report",
          level: "Flood Level",
          depth: "Flood Depth",
          desc: "Description",
          address: "Address",
          image: "Image (Recommended)",
          submit: "Submit Report",
          submitting: "Sending...",
          resolve: "Confirm Receded",
          levels: {
            low: "Low",
            medium: "Medium",
            high: "High",
            ankle: "Ankle (5-10cm)",
            knee: "Knee (30-50cm)",
            bike: "Bike Seat (50-80cm)"
          }
        }
      },
      create: {
        pageTitle: "Post a Rental Listing",
        pageSubtitle: "Just like posting on Facebook - Easy and Fast! ✨",
        sections: {
          media: "📸 Photos & Videos",
          basicInfo: "📝 Basic Information",
          location: "📍 Location on Map",
          amenities: "✨ Amenities",
          rules: "📋 House Rules"
        },
        labels: {
          upload: "Click to select photos/videos",
          uploadLimit: "Max 10 files, each file under 10MB",
          title: "Listing Title *",
          titlePlaceholder: "Ex: Nice room near Bach Khoa Uni...",
          description: "Detailed Description *",
          descriptionPlaceholder: "Detailed description of the room features, advantages...",
          price: "Rent (VND/month) *",
          deposit: "Deposit (VND)",
          area: "Area (m²) *",
          capacity: "Max Capacity *",
          bedrooms: "Bedrooms",
          bathrooms: "Bathrooms",
          roomType: "Room Type *",
          address: "Detailed Address *",
          district: "District *",
          city: "City",
          rulesPlaceholder: "Ex: No smoking, no pets, flexible hours..."
        },
        roomTypes: {
          single: "Single Room",
          shared: "Shared Room",
          apartment: "Apartment",
          house: "Whole House"
        },
        amenities: {
          ac: "Air Conditioning",
          heater: "Water Heater",
          fridge: "Refrigerator",
          washer: "Washing Machine",
          wifi: "Wifi",
          parking: "Parking",
          elevator: "Elevator",
          security: "24/7 Security",
          kitchen: "Cooking Allowed",
          school: "Near School",
          market: "Near Market",
          hospital: "Near Hospital"
        },
        buttons: {
          submit: "🚀 Post Now",
          submitting: "⏳ Posting...",
          cancel: "Cancel"
        },
        errors: {
          maxFiles: "Max 10 photos/videos",
          fileSize: "File size must not exceed 10MB",
          location: "Please select a location on the map",
          minImage: "Please add at least 1 image",
          success: "Listing created successfully! 🎉"
        }
      },
      // --- NEW SECTION FOR LISTING DETAIL ---
      listingDetail: {
        notFound: "Listing not found",
        description: "Description",
        amenities: "Amenities",
        rules: "House Rules",
        reviews: {
          title: "Reviews",
          writeButton: "Write a Review",
          ratingLabel: "Rating (stars)",
          commentLabel: "Comment",
          commentPlaceholder: "Share your experience...",
          submit: "Submit Review",
          cancel: "Cancel",
          empty: "No reviews yet. Be the first to review!",
          success: "Review submitted successfully!"
        },
        landlord: {
          info: "Landlord Info",
          verified: "Verified",
          phone: "Phone"
        },
        buttons: {
          message: "Message Landlord",
          save: "Save Listing",
          saved: "Saved",
          markStayed: "Mark as Stayed",
          markedStayed: "You have marked this room as stayed"
        },
        stayed: {
          dateLabel: "Stay Date",
          hint: "Mark as 'stayed' to write a review"
        },
        price: {
          perMonth: "/month",
          deposit: "Deposit"
        },
        capacity: "people",
        errors: {
          loginToSave: "Please login to save listing",
          loginToReview: "Please login",
          mustStay: "You must mark the room as 'stayed' before reviewing",
          noComment: "Please enter a comment",
          noDate: "Please select a stay date",
          markSuccess: "Marked as stayed successfully"
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi', // FORCE DEFAULT TO VIETNAMESE
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage'], // Only verify local storage
      caches: ['localStorage'],
    }
  });

export default i18n;