import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 1. Check if user has a saved preference, default to 'vi'
const savedLanguage = localStorage.getItem('i18nextLng') || 'vi';

const resources = {
  vi: {
    // ... (Your existing Vietnamese translations) ...
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
        savedRoommates: 'Đã lưu ghép trọ',
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
        },
        stats: {
          rooms: "Phòng trọ",
          landlords: "Chủ trọ",
          students: "Sinh viên",
          unis: "Trường ĐH"
        },
        cta: {
          title: "Bắt đầu tìm kiếm phòng trọ ngay hôm nay",
          subtitle: "Tham gia cộng đồng sinh viên tìm trọ lớn nhất Việt Nam",
          viewListings: "Xem danh sách phòng",
          viewMap: "Khám phá bản đồ"
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
          rating: "Đánh giá cao nhất",
          view: "Nhiều lượt xem nhất"
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
          lowPrice: "Giá rẻ (< 2.5tr)",
          medPrice: "Phổ thông (2.5-5tr)",
          highPrice: "Cao cấp (> 5tr)",
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
          media: "📸 Ảnh",
          basicInfo: "📝 Thông tin cơ bản",
          location: "📍 Vị trí trên bản đồ",
          amenities: "✨ Tiện nghi",
          rules: "📋 Nội quy"
        },
        labels: {
          upload: "Click để chọn ảnh",
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
          maxFiles: "Tối đa 10 ảnh",
          fileSize: "Kích thước file không được vượt quá 10MB",
          location: "Vui lòng chọn vị trí trên bản đồ",
          minImage: "Vui lòng thêm ít nhất 1 ảnh",
          success: "Đã đăng tin thành công! 🎉"
        }
      },
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
      },
      dashboard: {
        title: "Bảng điều khiển Chủ trọ",
        period: {
          week: "7 ngày qua",
          month: "30 ngày qua",
          year: "Năm nay"
        },
        buttons: {
          create: "Đăng tin mới"
        },
        stats: {
          totalListings: "Tổng tin đăng",
          activeListings: "đang hoạt động",
          views: "Lượt xem",
          saves: "Lượt lưu",
          savesDesc: "Sinh viên quan tâm",
          rating: "Đánh giá TB",
          ratingCount: "đánh giá"
        },
        priceAnalysis: {
          title: "So sánh giá với khu vực",
          yourAvg: "Giá trung bình của bạn",
          areaAvg: "Giá TB khu vực",
          diff: "Chênh lệch",
          high: "💡 Giá của bạn cao hơn trung bình khu vực. Hãy xem xét điều chỉnh để tăng tính cạnh tranh.",
          low: "💡 Giá của bạn thấp hơn trung bình khu vực. Bạn có thể tăng giá để tối ưu doanh thu.",
          ok: "✅ Giá của bạn phù hợp với thị trường."
        },
        keywords: {
          title: "Từ khóa tìm kiếm phổ biến",
          empty: "Chưa có dữ liệu từ khóa"
        },
        tips: {
          title: "💡 Mẹo tăng hiệu quả",
          l1: "• Đăng ảnh chất lượng cao và nhiều góc nhìn về phòng trọ",
          l2: "• Cập nhật thông tin thường xuyên để tin luôn ở vị trí cao",
          l3: "• Phản hồi nhanh chóng các tin nhắn và đánh giá của sinh viên",
          l4: "• Xác thực tài khoản để nhận huy hiệu \"Chủ trọ uy tín\""
        }
      },
      blog: {
        title: "Blog & Cộng đồng",
        subtitle: "Chia sẻ kinh nghiệm, mẹo hay và cảnh báo lừa đảo",
        searchPlaceholder: "Tìm kiếm bài viết...",
        createButton: "Viết bài",
        all: "Tất cả",
        tags: "Tags:",
        noPosts: "Chưa có bài viết nào trong danh mục này",
        categories: {
          tips: "Mẹo hay",
          experience: "Kinh nghiệm",
          checklist: "Checklist xem phòng",
          scamReport: "Cảnh báo lừa đảo",
          discussion: "Thảo luận"
        },
        create: {
          pageTitle: "Viết bài mới",
          titleLabel: "Tiêu đề *",
          titlePlaceholder: "Nhập tiêu đề bài viết...",
          categoryLabel: "Danh mục *",
          contentLabel: "Nội dung *",
          contentPlaceholder: "Viết nội dung bài viết...",
          tagsLabel: "Tags",
          tagsPlaceholder: "Nhập tags, cách nhau bằng dấu phẩy (vd: sinh viên, trọ, mẹo hay)",
          submit: "Đăng bài",
          submitting: "Đang đăng...",
          cancel: "Hủy",
          success: "Đã đăng bài viết"
        },
        post: {
          notFound: "Không tìm thấy bài viết",
          comments: "Bình luận",
          commentPlaceholder: "Viết bình luận...",
          submitComment: "Gửi bình luận",
          loginToComment: "Vui lòng đăng nhập",
          noComments: "Chưa có bình luận nào",
          successComment: "Đã thêm bình luận"
        }
      },
      stayed: {
        title: "Phòng đã từng ở",
        empty: "Bạn chưa đánh dấu phòng nào là đã từng ở",
        hint: "Đánh dấu phòng là \"đã ở\" để có thể đánh giá và bình luận về phòng đó",
        explore: "Khám phá phòng trọ",
        loginToView: "Vui lòng đăng nhập để xem phòng đã ở",
        login: "Đăng nhập",
        noRating: "Chưa có đánh giá"
      },
      saved: {
        title: "Phòng đã lưu",
        empty: "Bạn chưa lưu phòng nào",
        explore: "Khám phá phòng trọ",
        saved_roommate: "Đã lưu ghép trọ"
      },
      roommate: {
        title: "Tìm bạn cùng phòng",
        subtitle: "Dựa trên thói quen, sở thích và ngân sách của bạn",
        savedTitle: "Đã lưu ghép trọ",
        savedSubtitle: "Danh sách những người bạn đã lưu để tìm bạn cùng phòng",
        empty: "Chưa tìm thấy bạn cùng phòng phù hợp. Hãy thử cập nhật hồ sơ của bạn!",
        emptySaved: "Bạn chưa lưu ai vào danh sách. Hãy tìm bạn cùng phòng và lưu những người phù hợp!",
        findButton: "Tìm bạn cùng phòng",
        loginTitle: "Đăng nhập để tìm bạn cùng phòng",
        loginSubtitle: "Bạn cần đăng nhập để sử dụng tính năng này",
        setupProfileTitle: "Hoàn thiện hồ sơ tìm bạn cùng phòng",
        setupProfileSubtitle: "Vui lòng hoàn thiện hồ sơ trong phần Cài đặt để sử dụng tính năng tìm bạn cùng phòng.",
        goToProfile: "Đi tới cài đặt hồ sơ",
        profile: {
          budget: "Ngân sách",
          interests: "Sở thích",
          reasons: "Lý do phù hợp",
          intro: "Giới thiệu",
          habits: "Thói quen",
          viewProfile: "Xem hồ sơ",
          contact: "Liên hệ",
          save: "Lưu vào danh sách",
          unsave: "Xóa khỏi danh sách",
          saved: "Đã lưu",
          match: "Độ phù hợp",
          unlimited: "Không giới hạn",
          habitLabels: {
            sleep: "Giờ ngủ",
            clean: "Độ sạch sẽ",
            noise: "Tiếng ồn",
            smoke: "Hút thuốc",
            early: "Sớm",
            late: "Muộn",
            flexible: "Linh hoạt",
            quiet: "Yên tĩnh",
            moderate: "Vừa phải",
            noisy: "Ồn ào",
            yes: "Có",
            no: "Không"
          }
        }
      },
      profile: {
        title: "Hồ sơ cá nhân",
        tabs: {
          basic: "Thông tin cơ bản",
          roommate: "Hồ sơ tìm bạn cùng phòng"
        },
        labels: {
          name: "Họ và tên",
          email: "Email",
          phone: "Số điện thoại",
          gender: "Giới tính",
          looking: "Tôi đang tìm bạn cùng phòng",
          uni: "Trường đại học",
          major: "Chuyên ngành",
          bio: "Giới thiệu bản thân",
          bioPlaceholder: "Viết vài dòng về bản thân...",
          minBudget: "Ngân sách tối thiểu (VNĐ/tháng)",
          maxBudget: "Ngân sách tối đa (VNĐ/tháng)",
          enterAmount: "Nhập số tiền"
        },
        genders: {
          unknown: "Không xác định",
          male: "Nam",
          female: "Nữ",
          other: "Khác"
        },
        buttons: {
          save: "Lưu thay đổi",
          saveRoommate: "Lưu hồ sơ tìm bạn cùng phòng"
        },
        success: "Đã cập nhật hồ sơ"
      },
      messages: {
        title: "Tin nhắn",
        conversations: "Cuộc trò chuyện",
        noConversations: "Chưa có cuộc trò chuyện nào",
        roomCount: "phòng trọ",
        noMessages: "Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!",
        select: "Chọn một cuộc trò chuyện để bắt đầu",
        placeholder: "Nhập tin nhắn...",
        deleteConfirm: "Bạn có chắc chắn muốn xóa tin nhắn này?",
        deleteSuccess: "Đã xóa tin nhắn",
        createError: "Không thể tạo cuộc trò chuyện",
        sendError: "Không thể gửi tin nhắn",
        deleteError: "Không thể xóa tin nhắn"
      },
      admin: {
        noAccess: "Bạn không có quyền truy cập",
        accessDeniedTitle: "Không có quyền truy cập",
        accessDeniedDesc: "Chỉ quản trị viên mới có thể truy cập trang này.",
        title: "Bảng quản trị",
        stats: {
          users: "Tổng người dùng",
          listings: "Tổng bài đăng",
          blogs: "Tổng blog",
          banned: "Người dùng bị cấm"
        },
        tabs: {
          users: "Người dùng",
          listings: "Bài đăng",
          blogs: "Blog",
          annotations: "Chú thích bản đồ",
          reports: "Báo cáo ngập lụt"
        },
        table: {
          name: "Tên",
          email: "Email",
          role: "Vai trò",
          status: "Trạng thái",
          action: "Thao tác",
          title: "Tiêu đề",
          landlord: "Chủ trọ",
          price: "Giá",
          author: "Tác giả",
          type: "Loại",
          address: "Địa chỉ",
          level: "Mức độ",
          desc: "Mô tả",
          reporter: "Người báo cáo"
        },
        status: {
          banned: "Bị cấm",
          active: "Hoạt động"
        },
        confirm: {
          ban: "Bạn có chắc chắn muốn cấm người dùng này?",
          delete: "Bạn có chắc chắn muốn xóa?"
        },
        actions: {
          banSuccess: "Đã cấm người dùng",
          unbanSuccess: "Đã bỏ cấm người dùng",
          deleteSuccess: "Đã xóa thành công",
          error: "Thao tác thất bại"
        }
      },
      about: {
        title: {
          title1: "Về FindRoom",
          title2: "Hành trình kiến tạo không gian sống an toàn, tiện nghi và minh bạch dành cho sinh viên Việt Nam."
        },
        story: {
          title: "Câu chuyện của chúng tôi",
          p1: "Là những người từng trải qua quãng đời sinh viên, chúng tôi thấu hiểu sâu sắc nỗi vất vả khi đi tìm phòng trọ: thông tin thiếu minh bạch, hình ảnh \"treo đầu dê bán thịt chó\", và đau đớn nhất là vấn nạn lừa đảo tiền cọc.",
          p2_prefix: "FindRoom được thành lập với một mục tiêu duy nhất:",
          p2_strong: "Giải quyết triệt để những khó khăn đó.",
          p2_suffix: "Chúng tôi không chỉ xây dựng một trang web đăng tin, mà đang xây dựng một cộng đồng nơi niềm tin được đặt lên hàng đầu."
        },
        mission: {
          title: "Sứ mệnh",
          content: "Kết nối sinh viên với những chủ trọ uy tín thông qua công nghệ, tạo ra môi trường thuê phòng an toàn, minh bạch và nhanh chóng nhất."
        },
        vision: {
          title: "Tầm nhìn",
          content: "Trở thành nền tảng tìm kiếm nhà trọ số 1 dành cho sinh viên, nơi mà việc tìm chỗ ở dễ dàng như việc lướt mạng xã hội."
        },
        values: {
          title: "Cam kết của FindRoom",
          v1_title: "Thông tin xác thực",
          v1_desc: "Chúng tôi nỗ lực xác minh danh tính chủ trọ và kiểm duyệt tin đăng để loại bỏ tin rác.",
          v2_title: "Hoàn toàn miễn phí",
          v2_desc: "Miễn phí 100% trọn đời cho sinh viên tìm phòng. Không phí môi giới, không phí ẩn.",
          v3_title: "Hỗ trợ tận tâm",
          v3_desc: "Đội ngũ hỗ trợ luôn sẵn sàng lắng nghe và giải quyết các khiếu nại của người dùng."
        },
        cta: {
          title: "Bạn đã sẵn sàng tìm nơi ở mới?",
          btn_view: "Xem danh sách phòng",
          btn_register: "Đăng ký tài khoản"
        }
      }
    }
  },
  en: {
    // ... (Your existing English translations) ...
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
        savedRoommates: 'Saved Roommate',
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
        },
        stats: {
          rooms: "Rooms",
          landlords: "Landlords",
          students: "Students",
          unis: "Universities"
        },
        cta: {
          title: "Start finding your room today",
          subtitle: "Join the largest student accommodation community in Vietnam",
          viewListings: "Browse Listings",
          viewMap: "Explore Map"
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
          rating: "Highest Rated",
          view: "Highest View"
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
          lowPrice: "Budget (< 2.5M)",
          medPrice: "Standard (2.5-5M)",
          highPrice: "Premium (> 5M)",
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
          media: "📸 Photos",
          basicInfo: "📝 Basic Information",
          location: "📍 Location on Map",
          amenities: "✨ Amenities",
          rules: "📋 House Rules"
        },
        labels: {
          upload: "Click to select photos",
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
          maxFiles: "Max 10 photos",
          fileSize: "File size must not exceed 10MB",
          location: "Please select a location on the map",
          minImage: "Please add at least 1 image",
          success: "Listing created successfully! 🎉"
        }
      },
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
      },
      dashboard: {
        title: "Landlord Dashboard",
        period: {
          week: "Last 7 days",
          month: "Last 30 days",
          year: "This year"
        },
        buttons: {
          create: "Post New Listing"
        },
        stats: {
          totalListings: "Total Listings",
          activeListings: "active",
          views: "Views",
          saves: "Saves",
          savesDesc: "Interested students",
          rating: "Avg Rating",
          ratingCount: "reviews"
        },
        priceAnalysis: {
          title: "Price Comparison",
          yourAvg: "Your Average Price",
          areaAvg: "Area Average",
          diff: "Difference",
          high: "💡 Your price is higher than average. Consider adjusting to be competitive.",
          low: "💡 Your price is lower than average. You could increase rent to optimize revenue.",
          ok: "✅ Your pricing is competitive."
        },
        keywords: {
          title: "Top Search Keywords",
          empty: "No keyword data available"
        },
        tips: {
          title: "💡 Tips for Success",
          l1: "• Upload high-quality photos from multiple angles",
          l2: "• Update listings regularly to stay on top",
          l3: "• Respond quickly to messages and reviews",
          l4: "• Verify your account to get the \"Trusted Landlord\" badge"
        }
      },
      blog: {
        title: "Blog & Community",
        subtitle: "Share experiences, tips, and scam alerts",
        searchPlaceholder: "Search posts...",
        createButton: "Write Post",
        all: "All",
        tags: "Tags:",
        noPosts: "No posts found in this category",
        categories: {
          tips: "Tips & Tricks",
          experience: "Experience",
          checklist: "Viewing Checklist",
          scamReport: "Scam Alert",
          discussion: "Discussion"
        },
        create: {
          pageTitle: "Write New Post",
          titleLabel: "Title *",
          titlePlaceholder: "Enter post title...",
          categoryLabel: "Category *",
          contentLabel: "Content *",
          contentPlaceholder: "Write your content...",
          tagsLabel: "Tags",
          tagsPlaceholder: "Enter tags, separated by commas (ex: student, rent, tips)",
          submit: "Publish Post",
          submitting: "Publishing...",
          cancel: "Cancel",
          success: "Post published successfully"
        },
        post: {
          notFound: "Post not found",
          comments: "Comments",
          commentPlaceholder: "Write a comment...",
          submitComment: "Post Comment",
          loginToComment: "Please login to comment",
          noComments: "No comments yet",
          successComment: "Comment added"
        }
      },
      stayed: {
        title: "Stayed Listings",
        empty: "You haven't marked any rooms as stayed yet",
        hint: "Mark rooms as \"stayed\" to review and comment on them",
        explore: "Explore Listings",
        loginToView: "Please login to view stayed listings",
        login: "Login",
        noRating: "No ratings yet"
      },
      saved: {
        title: "Saved Listings",
        empty: "You haven't saved any listings yet",
        explore: "Explore Listings",
        savedroommates: "Saved Roommates"
      },
      roommate: {
        title: "Find Roommate",
        subtitle: "Based on your habits, interests, and budget",
        savedTitle: "Saved Roommates",
        savedSubtitle: "List of people you saved for roommate matching",
        empty: "No suitable roommates found. Try updating your profile!",
        emptySaved: "You haven't saved anyone yet. Find roommates and save the ones you like!",
        findButton: "Find Roommates",
        loginTitle: "Login to find roommates",
        loginSubtitle: "You need to login to use this feature",
        setupProfileTitle: "Complete your roommate profile",
        setupProfileSubtitle: "Please complete your profile in Settings to use the roommate finder.",
        goToProfile: "Go to Profile Settings",
        profile: {
          budget: "Budget",
          interests: "Interests",
          reasons: "Match Reasons",
          intro: "Intro",
          habits: "Habits",
          viewProfile: "View Profile",
          contact: "Contact",
          save: "Save to list",
          unsave: "Remove from list",
          saved: "Saved",
          match: "Match",
          unlimited: "Unlimited",
          habitLabels: {
            sleep: "Sleep Schedule",
            clean: "Cleanliness",
            noise: "Noise Level",
            smoke: "Smoking",
            early: "Early",
            late: "Late",
            flexible: "Flexible",
            quiet: "Quiet",
            moderate: "Moderate",
            noisy: "Noisy",
            yes: "Yes",
            no: "No"
          }
        }
      },
      profile: {
        title: "Profile",
        tabs: {
          basic: "Basic Info",
          roommate: "Roommate Profile"
        },
        labels: {
          name: "Full Name",
          email: "Email",
          phone: "Phone Number",
          gender: "Gender",
          looking: "I am looking for a roommate",
          uni: "University",
          major: "Major",
          bio: "Self Introduction",
          bioPlaceholder: "Write a few lines about yourself...",
          minBudget: "Min Budget (VND/month)",
          maxBudget: "Max Budget (VND/month)",
          enterAmount: "Enter amount"
        },
        genders: {
          unknown: "Unknown",
          male: "Male",
          female: "Female",
          other: "Other"
        },
        buttons: {
          save: "Save Changes",
          saveRoommate: "Save Roommate Profile"
        },
        success: "Profile updated successfully"
      },
      messages: {
        title: "Messages",
        conversations: "Conversations",
        noConversations: "No conversations yet",
        roomCount: "listings",
        noMessages: "No messages yet. Start the conversation!",
        select: "Select a conversation to start",
        placeholder: "Type a message...",
        deleteConfirm: "Are you sure you want to delete this message?",
        deleteSuccess: "Message deleted",
        createError: "Failed to create conversation",
        sendError: "Failed to send message",
        deleteError: "Failed to delete message"
      },
      admin: {
        noAccess: "Access Denied",
        accessDeniedTitle: "Access Denied",
        accessDeniedDesc: "Only administrators can access this page.",
        title: "Admin Panel",
        stats: {
          users: "Total Users",
          listings: "Total Listings",
          blogs: "Total Blogs",
          banned: "Banned Users"
        },
        tabs: {
          users: "Users",
          listings: "Listings",
          blogs: "Blogs",
          annotations: "Map Annotations",
          reports: "Flood Reports"
        },
        table: {
          name: "Name",
          email: "Email",
          role: "Role",
          status: "Status",
          action: "Actions",
          title: "Title",
          landlord: "Landlord",
          price: "Price",
          author: "Author",
          type: "Type",
          address: "Address",
          level: "Level",
          desc: "Description",
          reporter: "Reporter"
        },
        status: {
          banned: "Banned",
          active: "Active"
        },
        confirm: {
          ban: "Are you sure you want to ban this user?",
          delete: "Are you sure you want to delete this?"
        },
        actions: {
          banSuccess: "User banned",
          unbanSuccess: "User unbanned",
          deleteSuccess: "Deleted successfully",
          error: "Action failed"
        }
      },
      about: {
        title: {
          title1: "About FindRoom",
          title2: "The journey to create a safe, convenient, and transparent living space for Vietnamese students."
        },
        story: {
          title: "Our Story",
          p1: "Having experienced student life firsthand, we deeply understand the hardships of finding a room: lack of transparency, \"bait-and-switch\" images, and most painfully, deposit fraud issues.",
          p2_prefix: "FindRoom was founded with a single goal:",
          p2_strong: "To thoroughly solve these difficulties.",
          p2_suffix: "We are not just building a listing website, but building a community where trust comes first."
        },
        mission: {
          title: "Mission",
          content: "Connecting students with reputable landlords through technology, creating the safest, most transparent, and fastest rental environment."
        },
        vision: {
          title: "Vision",
          content: "To become the #1 accommodation finder platform for students, where finding a place to live is as easy as scrolling through social media."
        },
        values: {
          title: "FindRoom's Commitment",
          v1_title: "Verified Information",
          v1_desc: "We strive to verify landlord identities and moderate listings to eliminate spam.",
          v2_title: "Completely Free",
          v2_desc: "100% free for life for students finding rooms. No brokerage fees, no hidden fees.",
          v3_title: "Dedicated Support",
          v3_desc: "Our support team is always ready to listen and resolve user complaints."
        },
        cta: {
          title: "Ready to find your new place?",
          btn_view: "Browse Listings",
          btn_register: "Register Account"
        }
      },
      faq: {
        title: "Frequently Asked Questions",
        subtitle: "We are here to answer all your questions about the rental process.",
        tabs: {
          tenant: "For Tenants",
          landlord: "For Landlords"
        },
        footer: {
          text: "Still haven't found an answer?",
          link: "Contact Support"
        },
        tenant: {
          q1: "Is finding a room on FindRoom free?",
          a1: "Completely free! FindRoom commits to zero brokerage fees for students/tenants.",
          q2: "How to avoid rental scams?",
          a2: "Absolutely DO NOT transfer deposit money without seeing the room in person and meeting the landlord. Prioritize listings from landlords with a Blue Check (Verified) and always sign a clear contract.",
          q3: "Can I cancel a viewing appointment?",
          a3: "Yes. If you are busy, please go to 'Appointment Management' to cancel or message the landlord. This helps maintain your account credibility.",
          q4: "What is the 'Save Listing' feature for?",
          a4: "It helps you save rooms you like to easily compare prices and locations before making a final decision."
        },
        landlord: {
          q1: "Is posting a listing free?",
          a1: "Currently, FindRoom supports free posting for all landlords to build the community. In the future, there may be premium paid services (pushing listings, featured listings).",
          q2: "How do I get more views on my listing?",
          a2: "Beautiful, bright photos and detailed information are key. Fill in full details about electricity, water prices, amenities, and security descriptions.",
          q3: "How do I get the 'Verified Landlord' blue check?",
          a3: "You need to update your profile and upload your ID card for system verification. Verified landlords are trusted 3x more by tenants.",
          q4: "Can I hide a listing when rented?",
          a4: "Yes. Go to 'Listing Management' and change the status to 'Hidden' or 'Rented' to stop receiving inquiries."
        }
      },
      terms: {
        title: "Terms of Use",
        lastUpdated: "Last Updated: 14/12/2025",
        intro: "Welcome to FindRoom. By accessing and using this platform, you agree to comply with the following terms. Please read carefully to protect your rights.",
        s1: {
          title: "1. User Account",
          l1: "Users are responsible for the security of their login information (email, password).",
          l2: "You must provide accurate information when registering (real name, contact phone number).",
          l3: "Do not use another person's account or impersonate any individual/organization."
        },
        s2: {
          title: "2. Posting Rules (For Landlords)",
          l1: "Real Images: Room photos must be real, do not use misleading illustrations from the internet.",
          l2: "Transparent Pricing: Exact rental prices must be listed, including electricity, water, and other service fees (if any).",
          l3: "Accurate Information: Correctly describe the room condition (area, furniture, amenities).",
          l4: "FindRoom reserves the right to reject or remove listings that violate rules, lack info, or show signs of fraud without prior notice."
        },
        s3: {
          title: "3. Prohibited Acts",
          l1: "Fraudulent behavior.",
          l2: "Using uncultured language, harassing, or threatening other users.",
          l3: "Posting pornographic, political content, or content violating Vietnamese law.",
          l4: "Spamming listings or creating multiple fake accounts to manipulate ratings."
        },
        s4: {
          title: "4. Disclaimer",
          intro: "FindRoom is an intermediary technology platform connecting landlords and tenants. We strive to verify identities (via blue checks) and moderate listings, however:",
          l1: "FindRoom is not legally responsible for monetary transactions or rental contracts between Landlords and Tenants.",
          l2: "Tenants need to equip themselves with knowledge, view rooms in person, and sign clear contracts before transacting money.",
          l3: "We do not guarantee 100% accuracy of all user-generated listings."
        },
        s5: {
          title: "5. Additional Terms",
          content: "We reserve the right to change or modify these terms at any time to suit actual situations. Changes will take effect immediately upon posting on the website."
        }
      },
      privacy: {
        title: "Privacy Policy",
        subtitle: "Committed to protecting your personal information",
        intro: "At FindRoom, we understand that privacy is extremely important. This policy describes in detail how we collect, use, and protect your personal information.",
        s1: {
          title: "1. Data Collection",
          intro: "We only collect information necessary to operate the service:",
          l1: "Identity Information: Name, email address, phone number, and avatar.",
          l2: "Activity Data: Viewing history, saved rooms, and review history."
        },
        s2: {
          title: "2. Scope of Information Use",
          l1: "Account Verification: Ensuring a safe environment, eliminating fake or fraudulent accounts."
        },
        s3: {
          title: "3. Information Sharing",
          subtitle: "The 3 NOs Commitment:",
          l1: "NO selling personal data to third parties.",
          l2: "NO sharing information with advertising/marketing companies.",
          l3: "NO publishing sensitive information on the website."
        },
        s4: {
          title: "4. Data Security",
          content: "All personal information is stored on secure servers. User passwords are one-way encrypted (Hashing) before being saved to the database, ensuring even FindRoom employees cannot know your password."
        },
        s5: {
          title: "5. User Rights",
          intro: "You have full control over your data:",
          l1: "Edit: You can update personal information at any time in the \"Profile\" page.",
          l2: "Delete Account: You have the right to request permanent deletion of your account and all related data from our system by contacting the support team."
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // 2. Use the saved language
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
    }
  });

export default i18n;