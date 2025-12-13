# 🔧 Fix Lỗi 500

## ✅ Đã sửa

1. ✅ Route `/stayed-listings` - cải thiện error handling
2. ✅ Error logging - thêm chi tiết hơn trong server.js

## 🔍 Cách kiểm tra lỗi 500

### Bước 1: Kiểm tra Backend Logs trên Render

1. Vào Render Dashboard
2. Chọn **Backend Service**
3. Vào tab **Logs**
4. Tìm các dòng có `❌ Error:` hoặc `Error fetching stayed listings:`
5. Copy error message và stack trace

### Bước 2: Kiểm tra Console trong Browser

1. Mở frontend URL
2. `F12` → Console tab
3. Tìm error message
4. Click vào error để xem chi tiết
5. Xem `response.data` để biết error message từ server

### Bước 3: Kiểm tra Network Tab

1. `F12` → Network tab
2. Reload trang hoặc trigger action gây lỗi
3. Tìm request có status `500`
4. Click vào request
5. Vào tab **Response** để xem error message từ server

---

## 🐛 Các nguyên nhân phổ biến gây lỗi 500

### 1. Listing đã bị xóa nhưng vẫn trong stayedListings

**Triệu chứng:**
- Error trong populate khi Listing không tồn tại

**Giải pháp:**
- ✅ Đã fix trong code - filter out null values

### 2. Landlord không tồn tại

**Triệu chứng:**
- Error khi populate landlord

**Giải pháp:**
- Code đã handle - chỉ select fields cần thiết

### 3. Database connection issue

**Triệu chứng:**
- Connection timeout hoặc connection lost

**Kiểm tra:**
- MongoDB Atlas connection string
- Network connectivity

### 4. Schema mismatch

**Triệu chứng:**
- Error khi populate không match schema

**Kiểm tra:**
- Listing model có field `landlord` không?
- User model có field `stayedListings` không?

---

## 🔧 Debug Steps

### 1. Test route trực tiếp

Dùng Postman hoặc curl để test:

```bash
# Get token từ login
# Sau đó:
curl -X GET "https://your-backend.onrender.com/api/users/stayed-listings" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Kiểm tra database

Vào MongoDB Atlas và kiểm tra:
- User document có `stayedListings` array không?
- Các Listing IDs trong `stayedListings` có tồn tại không?
- Các Listing có field `landlord` không?

### 3. Test với user mới

Thử tạo user mới và test:
- User chưa có stayedListings → phải return `[]`
- User có stayedListings → phải return danh sách

---

## 📋 Checklist Debug

- [ ] Backend logs trên Render có error gì không?
- [ ] Error message từ server là gì?
- [ ] Database có dữ liệu hợp lệ không?
- [ ] User có `stayedListings` không?
- [ ] Các Listing IDs có tồn tại trong database không?
- [ ] Listing có field `landlord` không?
- [ ] Landlord có tồn tại không?

---

## 🎯 Quick Fix

Nếu vẫn gặp lỗi 500:

1. **Kiểm tra logs trên Render** → xem error cụ thể
2. **Kiểm tra response trong Network tab** → xem error message
3. **Test với Postman** → để xem error response chi tiết

Sau đó cung cấp error message cụ thể để fix chính xác hơn!

---

*Sau khi sửa, route sẽ handle errors tốt hơn và không còn 500 nữa!* ✅
