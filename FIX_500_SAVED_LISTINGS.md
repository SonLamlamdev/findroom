# Giải Thích Lỗi 500 - /api/users/saved-listings

## Lỗi Hiện Tại

```
GET https://student-accommodation-backend.onrender.com/api/users/saved-listings 500 (Internal Server Error)
```

Lỗi **500 Internal Server Error** nghĩa là có vấn đề ở **backend server**, không phải frontend.

---

## Nguyên Nhân Có Thể

### 1. **Lỗi trong Auth Middleware**
- Token không hợp lệ
- User không tồn tại sau khi decode token
- `req.userId` không được set đúng cách

### 2. **Lỗi Database Query**
- User không tồn tại trong database
- `savedListings` array có chứa ObjectId không hợp lệ
- Listing đã bị xóa nhưng vẫn còn trong `savedListings`

### 3. **Lỗi Populate**
- Landlord đã bị xóa nhưng listing vẫn reference đến
- ObjectId format không đúng

### 4. **Lỗi Database Connection**
- MongoDB connection bị timeout
- Network issue

---

## Cách Debug - Xem Error Message Chi Tiết

### Bước 1: Xem Logs trên Render

1. **Vào Render Dashboard**: https://dashboard.render.com
2. **Chọn Backend Service** → Tab **"Logs"**
3. **Tìm error message** bằng cách search (Ctrl+F):
   - `❌ Error fetching saved listings`
   - `❌ Error:`
   - `/api/users/saved-listings`

### Bước 2: Error Message Sẽ Hiển Thị Như Sau:

```
❌ Error fetching saved listings: {
  error: '...error message...',
  stack: 'Error: ...\n    at ...',
  userId: '...user id...'
}
```

Hoặc từ global error handler:

```
❌ Error: {
  message: '...',
  stack: '...',
  url: '/api/users/saved-listings',
  method: 'GET',
  ...
}
```

---

## Các Lỗi Thường Gặp và Cách Fix

### Lỗi 1: "User not found"
**Nguyên nhân**: User ID từ token không tồn tại trong database

**Fix**: 
- Check xem user có tồn tại không
- Verify token được tạo đúng cách

### Lỗi 2: "Cannot read property 'savedListings' of null"
**Nguyên nhân**: User query trả về null

**Fix**: Đã được handle trong code mới

### Lỗi 3: "CastError: Cast to ObjectId failed"
**Nguyên nhân**: `savedListings` có chứa giá trị không phải ObjectId

**Fix**: Code đã validate ObjectId trước khi query

### Lỗi 4: Database Timeout
**Nguyên nhân**: Query quá lâu hoặc connection issue

**Fix**: 
- Check MongoDB connection
- Optimize query (code đã được optimize)

---

## Code Đã Được Cải Thiện

### ✅ Error Handling
- Validate `req.userId` trước khi query
- Try-catch cho từng listing
- Skip invalid listings thay vì crash
- Log chi tiết error message

### ✅ Database Query
- Validate ObjectId trước khi query
- Handle null landlord
- Return empty array nếu không có listings

---

## Cách Test

### 1. Test với User có Saved Listings
```
GET /api/users/saved-listings
Headers: Authorization: Bearer <token>
```

### 2. Test với User không có Saved Listings
- Should return: `{ listings: [] }`

### 3. Test với Invalid Token
- Should return: `401 Unauthorized`

---

## Next Steps

### 1. **Xem Logs trên Render** (Quan trọng nhất)
   - Copy error message đầy đủ
   - Copy stack trace
   - Gửi lại để fix chính xác

### 2. **Check Browser Network Tab**
   - Mở DevTools (F12)
   - Tab "Network"
   - Click vào request `/api/users/saved-listings`
   - Tab "Response" → xem error message từ server

### 3. **Check Auth Token**
   - Verify token có được gửi trong headers không
   - Check token có hết hạn không

---

## Format Error Response

Khi có lỗi, response sẽ là:

```json
{
  "error": "Server error",
  "message": "..." // chỉ trong development
}
```

Hoặc từ global handler:

```json
{
  "error": {
    "message": "Error message here"
  }
}
```

---

## Ví Dụ Error Logs

### Example 1: User Not Found
```
❌ Error fetching saved listings: {
  error: 'User not found',
  userId: '507f1f77bcf86cd799439011'
}
```

### Example 2: Database Error
```
❌ Error fetching saved listings: {
  error: 'MongoNetworkError: connection timeout',
  userId: '507f1f77bcf86cd799439011'
}
```

### Example 3: Invalid ObjectId
```
Skipping invalid ObjectId in saved listings: invalid-id-123
```

---

## Để Fix Ngay

1. **Xem logs trên Render** → Tìm error message chính xác
2. **Gửi error message** cho tôi để fix
3. **Hoặc** check các nguyên nhân trên và fix tương ứng

---

## Nếu Vẫn Lỗi Sau Khi Deploy Code Mới

1. **Đảm bảo code đã được deploy**:
   - Check Render → Latest deployment
   - Verify code mới đã được build

2. **Clear cache và rebuild**:
   - Render → Manual Deploy → "Clear build cache & deploy"

3. **Restart service**:
   - Render → Settings → Restart

---

## Quick Checklist

- [ ] Xem logs trên Render Dashboard
- [ ] Tìm error message chi tiết
- [ ] Check auth token có hợp lệ không
- [ ] Verify user tồn tại trong database
- [ ] Check MongoDB connection
- [ ] Verify code mới đã được deploy
