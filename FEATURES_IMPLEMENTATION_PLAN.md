# Kế hoạch Triển khai Tính năng

## Tổng quan
File này liệt kê tất cả các tính năng cần implement và thứ tự ưu tiên.

## Phân loại theo độ ưu tiên

### 🔴 Ưu tiên cao (Core Features)
1. ✅ Sort/filter phòng trọ (khu vực, hình thức, giá, tiện nghi)
2. ✅ Tìm kiếm blog theo từ khóa, đánh giá, tag
3. ✅ Rate và bình luận phòng (chỉ user đã ở mới được rate)
4. ✅ Saved listings (giỏ hàng/lưu trọ)
5. ✅ Giỏ trọ đã từng ở

### 🟡 Ưu tiên trung bình (Important Features)
6. Tìm kiếm gợi ý quận khi ping trên map
7. Fix lỗi xem hồ sơ tìm bạn cùng phòng
8. Chú thích trên bản đồ theo tiêu chí
9. Đăng thông tin chú thích trên bản đồ
10. Tiêu chí nổi bật cho tìm bạn cùng phòng
11. Lọc phần tìm bạn cùng phòng
12. Hiện thông tin bài đăng tìm bạn
13. Trang tìm bạn với bộ lọc

### 🟢 Ưu tiên thấp (Nice to Have)
14. Báo cáo ngập lụt real-time
15. Nhắn tin giữa chủ trọ và người thuê
16. Google Maps - đường đi ngắn nhất
17. 3 tài khoản ADMIN
18. Thông báo cho chủ trọ khi có report
19. Thêm giới tính vào thông tin cá nhân
20. Xóa số 0 ở đầu ngân sách
21. ID mặc định cho bài đăng/blog
22. Tính năng đặc trưng cho chủ trọ
23. Sửa tính năng dịch
24. Cải thiện UI/UX với animation

## Chi tiết Implementation

### 1. Sort/Filter Phòng trọ

**Backend (`backend/routes/listings.js`):**
- Thêm sort options: price, createdAt, rating, views
- Thêm filter: amenities (array), district, city, roomType, price range
- Cải thiện search với full-text search

**Frontend (`frontend/src/pages/Listings.tsx`):**
- Thêm UI cho sort dropdown
- Thêm filter sidebar với checkboxes cho amenities
- Auto-apply filters khi thay đổi

### 2. Tìm kiếm Blog

**Backend (`backend/routes/blogs.js`):**
- Thêm sort: likes, views, rating (nếu có), createdAt
- Cải thiện tag search
- Thêm full-text search index

**Frontend (`frontend/src/pages/Blog.tsx`):**
- Thêm search bar
- Thêm sort dropdown
- Hiển thị tags và filter theo tag

### 3. Rate và Bình luận Phòng

**Backend:**
- Thêm field `stayedAt` vào Review model để track user đã ở
- Validation: chỉ user đã ở mới được rate
- Thêm route để mark user đã ở phòng

**Frontend:**
- UI để rate (5 sao)
- Hiển thị "Chưa có đánh giá" nếu chưa có review
- Form để đánh dấu đã ở phòng

### 4. Saved Listings

**Backend:**
- Sử dụng `savedListings` array trong User model
- Routes: GET, POST, DELETE saved listings

**Frontend:**
- Button "Lưu" trên listing card
- Trang "Đã lưu" hiển thị saved listings

### 5. Giỏ trọ đã từng ở

**Backend:**
- Thêm field `stayedListings` vào User model
- Route để mark listing là "đã ở"

**Frontend:**
- Trang "Đã ở" hiển thị listings đã ở
- Tự động thêm vào khi user rate phòng

---

## Notes

- Mỗi tính năng sẽ được implement trong các commits riêng
- Test từng tính năng trước khi chuyển sang tính năng tiếp theo
- Update documentation khi hoàn thành

