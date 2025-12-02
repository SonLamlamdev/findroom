# Hướng dẫn Deploy Website Lên Internet

Hướng dẫn chi tiết các cách deploy ứng dụng Student Accommodation Platform lên internet.

## Tổng quan

Ứng dụng bao gồm:
- **Frontend**: React + Vite (Port 5173)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: MongoDB

## Phương án 1: Deploy miễn phí (Khuyến nghị cho sinh viên)

### 1.1. Frontend: Vercel (Miễn phí, dễ nhất)

#### Bước 1: Chuẩn bị Frontend
1. **Cập nhật file `frontend/vite.config.ts`**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Thêm cho production
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

2. **Tạo file `frontend/.env.production`**:
```env
VITE_API_URL=https://your-backend-url.railway.app
# Hoặc URL backend của bạn
```

3. **Cập nhật `frontend/package.json`** thêm script:
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

#### Bước 2: Deploy lên Vercel

**Cách 1: Qua GitHub (Khuyến nghị)**
1. Push code lên GitHub repository
2. Truy cập [vercel.com](https://vercel.com)
3. Sign in bằng GitHub
4. Click "New Project"
5. Import repository của bạn
6. Cấu hình:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
7. Thêm Environment Variables:
   - `VITE_API_URL`: URL của backend API
8. Click "Deploy"
9. Sau khi deploy xong, bạn sẽ có URL như: `https://your-app.vercel.app`

**Cách 2: Qua Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel login
vercel
```
Làm theo hướng dẫn trên terminal.

### 1.2. Backend: Railway.app (Miễn phí $5/tháng)

#### Bước 1: Chuẩn bị Backend

1. **Tạo file `backend/railway.json`** (optional):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Cập nhật `backend/package.json`**:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

3. **Tạo file `backend/.railwayignore`**:
```
node_modules
uploads/*
.env
*.log
.git
```

#### Bước 2: Deploy lên Railway

1. Truy cập [railway.app](https://railway.app)
2. Sign up/Sign in bằng GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Chọn repository của bạn
5. Railway sẽ tự động detect Node.js
6. **Cấu hình**:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
7. **Thêm Environment Variables** trong Railway dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-accommodation
   JWT_SECRET=your-super-secret-key-here
   PORT=5000
   CLIENT_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```
8. Railway sẽ tự động deploy và cung cấp URL: `https://your-app.railway.app`

#### Bước 3: Tạo Custom Domain (Optional)
1. Vào Settings → Domains
2. Thêm domain của bạn
3. Follow hướng dẫn để cấu hình DNS

### 1.3. Database: MongoDB Atlas (Miễn phí)

#### Bước 1: Tạo MongoDB Atlas Cluster

1. Truy cập [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Sign in
3. Click "Build a Database" → Chọn FREE (M0)
4. Chọn Cloud Provider và Region (chọn gần Việt Nam: Singapore)
5. Đặt tên cluster (VD: "student-accommodation")
6. Click "Create Cluster"

#### Bước 2: Cấu hình Security

1. **Tạo Database User**:
   - Vào "Database Access" → "Add New Database User"
   - Username: `admin` (hoặc tên bạn muốn)
   - Password: Tạo password mạnh
   - Database User Privileges: "Atlas admin" hoặc "Read and write to any database"
   - Click "Add User"

2. **Whitelist IP Address**:
   - Vào "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) - **Chỉ cho development**
   - Hoặc thêm IP cụ thể của Railway/VPS

#### Bước 3: Lấy Connection String

1. Vào "Database" → Click "Connect"
2. Chọn "Connect your application"
3. Driver: "Node.js", Version: latest
4. Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student-accommodation?retryWrites=true&w=majority
   ```
5. Thay `<username>` và `<password>` bằng user vừa tạo
6. Thay `<database>` bằng tên database (VD: `student-accommodation`)

#### Bước 4: Cập nhật Backend

Cập nhật `MONGODB_URI` trong Railway environment variables:
```
MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/student-accommodation?retryWrites=true&w=majority
```

---

## Phương án 2: Render.com (Miễn phí, dễ hơn)

### 2.1. Frontend trên Render

1. Truy cập [render.com](https://render.com)
2. Sign up/Sign in bằng GitHub
3. Click "New" → "Static Site"
4. Connect GitHub repository
5. Cấu hình:
   - **Name**: `student-accommodation-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**: `VITE_API_URL=https://your-backend.onrender.com`
6. Click "Create Static Site"

### 2.2. Backend trên Render

1. Click "New" → "Web Service"
2. Connect GitHub repository
3. Cấu hình:
   - **Name**: `student-accommodation-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (sleeps after 15 min inactivity)
4. **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret
   PORT=10000
   CLIENT_URL=https://your-frontend.onrender.com
   ```
5. Click "Create Web Service"

---

## Phương án 3: VPS (Virtual Private Server) - Tự quản lý

### 3.1. Chuẩn bị VPS

**Nhà cung cấp VPS miễn phí/thấp giá:**
- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [Google Cloud Free Tier](https://cloud.google.com/free)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [DigitalOcean](https://www.digitalocean.com/) - $5/tháng
- [Vultr](https://www.vultr.com/) - $2.50/tháng

### 3.2. Cài đặt trên VPS (Ubuntu/Debian)

```bash
# 1. Cập nhật system
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Cài đặt MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# 4. Cài đặt PM2 (Process Manager)
sudo npm install -g pm2

# 5. Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 6. Cài đặt dependencies
cd backend
npm install
cd ../frontend
npm install

# 7. Build frontend
npm run build

# 8. Cấu hình backend .env
cd ../backend
nano .env
# Thêm các biến môi trường

# 9. Khởi chạy backend với PM2
pm2 start server.js --name "student-accommodation-api"
pm2 save
pm2 startup

# 10. Cài đặt Nginx
sudo apt install -y nginx

# 11. Cấu hình Nginx cho Frontend
sudo nano /etc/nginx/sites-available/default
```

**Cấu hình Nginx cho Frontend:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /path/to/your/repo/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

```bash
# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 3.3. SSL Certificate (HTTPS)

```bash
# Cài đặt Certbot
sudo apt install -y certbot python3-certbot-nginx

# Lấy SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Phương án 4: Docker + Cloud Platform

### 4.1. Tạo Dockerfile

**Backend Dockerfile (`backend/Dockerfile`):**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

**Frontend Dockerfile (`frontend/Dockerfile`):**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 4.2. Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: student-accommodation

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/student-accommodation
      JWT_SECRET: your-secret-key
      PORT: 5000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Deploy lên:
- **Fly.io**: `flyctl launch`
- **Railway**: Upload Dockerfile
- **Google Cloud Run**: `gcloud run deploy`
- **AWS ECS/Fargate**

---

## Checklist Trước Khi Deploy

### Frontend
- [ ] Đã build thành công (`npm run build`)
- [ ] Đã cấu hình `VITE_API_URL` trong `.env.production`
- [ ] Đã test build local (`npm run preview`)
- [ ] Đã loại bỏ console.log không cần thiết

### Backend
- [ ] Đã set `NODE_ENV=production`
- [ ] Đã cấu hình `MONGODB_URI` (Atlas)
- [ ] Đã set `JWT_SECRET` mạnh và bảo mật
- [ ] Đã cấu hình `CLIENT_URL` đúng frontend URL
- [ ] Đã test kết nối MongoDB
- [ ] Đã cấu hình CORS đúng
- [ ] Đã setup error handling

### Database
- [ ] Đã tạo MongoDB Atlas cluster
- [ ] Đã tạo database user
- [ ] Đã whitelist IP (hoặc allow từ anywhere cho development)
- [ ] Đã test connection string

### Security
- [ ] Đã đổi `JWT_SECRET` thành secret mạnh
- [ ] Đã kiểm tra không hardcode secrets trong code
- [ ] Đã cấu hình rate limiting
- [ ] Đã setup HTTPS (cho production)

---

## Troubleshooting

### Backend không kết nối được MongoDB Atlas
1. Kiểm tra IP whitelist trong MongoDB Atlas
2. Kiểm tra username/password trong connection string
3. Kiểm tra firewall của VPS (nếu dùng VPS)

### Frontend không gọi được API - Lỗi 404 "Request failed with status code 404"

**Nguyên nhân phổ biến:**
- `VITE_API_URL` chưa được cấu hình trong production
- `VITE_API_URL` được cấu hình sai (sai URL, thiếu https, có trailing slash)
- Backend chưa được deploy hoặc đã bị tắt

**Cách khắc phục:**

1. **Kiểm tra VITE_API_URL trong Vercel/Render:**
   - Vào Settings → Environment Variables
   - Tìm biến `VITE_API_URL`
   - Đảm bảo giá trị là URL đầy đủ của backend (VD: `https://your-app.railway.app`)
   - **Lưu ý:** Không có dấu `/` ở cuối URL
   - Redeploy lại frontend sau khi thay đổi

2. **Kiểm tra Backend đang chạy:**
   - Mở URL backend trong browser (VD: `https://findroom-qd83.onrender.com/api/health`)
   - Nếu thấy `{"status":"OK","message":"Server is running"}` → Backend OK
   - Nếu không truy cập được → Backend đã bị tắt hoặc chưa deploy
   - **Lưu ý:** Render free tier có thể sleep sau 15 phút không có traffic, cần "đánh thức" bằng cách gửi request

3. **Kiểm tra Console trong Browser:**
   - Mở Developer Tools (F12) → Console tab
   - Tìm các thông báo lỗi về API URL
   - Xem Network tab để kiểm tra URL đang được gọi

4. **Kiểm tra CORS settings trong backend:**
   - Đảm bảo `CLIENT_URL` trong backend environment variables trỏ đúng frontend URL
   - Kiểm tra file `backend/server.js` có cấu hình CORS đúng

**Ví dụ cấu hình đúng:**
```
VITE_API_URL=https://findroom-qd83.onrender.com
```
KHÔNG phải:
```
VITE_API_URL=https://findroom-qd83.onrender.com/  ❌ (có dấu / ở cuối)
VITE_API_URL=findroom-qd83.onrender.com  ❌ (thiếu https://)
VITE_API_URL=http://findroom-qd83.onrender.com  ❌ (dùng http thay vì https)
```

**Trên Render (Backend), cần cấu hình:**
```
CLIENT_URL=https://your-frontend-url.vercel.app
```
(Thay `your-frontend-url.vercel.app` bằng URL frontend thực tế của bạn)

### Build failed
1. Kiểm tra Node.js version (>= 16)
2. Xóa `node_modules` và `package-lock.json`, cài lại
3. Kiểm tra lỗi trong build log

### Ứng dụng chạy chậm (Render free tier)
- Render free tier sleep sau 15 phút không có traffic
- Upgrade lên paid plan hoặc dùng Railway/Render paid tier

---

## So sánh các phương án

| Platform | Frontend | Backend | Database | Cost | Difficulty |
|----------|----------|---------|----------|------|------------|
| **Vercel + Railway + Atlas** | ✅ Dễ | ✅ Dễ | ✅ Dễ | 🆓 Free | ⭐ Dễ |
| **Render Full** | ✅ Dễ | ⚠️ Sleep | ⚠️ Cần Atlas | 🆓 Free | ⭐ Dễ |
| **VPS** | ⚠️ Phức tạp | ⚠️ Phức tạp | ✅ Built-in | 💰 $2-5/mo | ⭐⭐⭐ Khó |
| **Docker + Cloud** | ⚠️ Phức tạp | ⚠️ Phức tạp | ⚠️ Cần Atlas | 💰 Varies | ⭐⭐⭐⭐ Rất khó |

---

## Khuyến nghị cho Sinh viên

**Phương án tốt nhất: Vercel + Railway + MongoDB Atlas**
- ✅ Hoàn toàn miễn phí
- ✅ Dễ deploy
- ✅ Không cần kiến thức server
- ✅ Có SSL tự động
- ✅ Hỗ trợ custom domain

---

## Tài liệu tham khảo

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [PM2 Docs](https://pm2.keymetrics.io/docs/)

---

Chúc bạn deploy thành công! 🚀

