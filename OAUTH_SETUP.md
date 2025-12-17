# 🔐 Hướng dẫn cấu hình xác thực OAuth

## Google OAuth Setup

### 1. Tạo Google Cloud Project
- Truy cập [Google Cloud Console](https://console.cloud.google.com/)
- Tạo một dự án mới
- Kích hoạt **Google+ API**

### 2. Tạo OAuth 2.0 Credentials
- Đi đến **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
- Chọn loại: **Web application**
- Authorized JavaScript origins:
  - `http://localhost:5173` (development)
  - `http://localhost:3000` (development)
  - Địa chỉ production của bạn
- Authorized redirect URIs:
  - `http://localhost:5173`
  - `http://localhost:3000`
  - Địa chỉ production của bạn

### 3. Sao chép Client ID
Sao chép `Client ID` và dán vào file `.env.local`:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

---

## Microsoft OAuth Setup

### 1. Tạo Azure App Registration
- Truy cập [Azure Portal](https://portal.azure.com/)
- Tìm **App registrations**
- Kích vào **New registration**

### 2. Cấu hình ứng dụng
- **Name**: Tên ứng dụng của bạn
- **Supported account types**: "Accounts in any organizational directory and personal Microsoft accounts"

### 3. Tạo Client Secret
- Đi đến **Certificates & secrets**
- Kích vào **New client secret**
- Sao chép giá trị secret

### 4. Cấu hình Redirect URI
- Đi đến **Authentication**
- Thêm **Web** redirect URIs:
  - `http://localhost:5173/auth/callback`
  - `http://localhost:3000/auth/callback`
  - Địa chỉ production của bạn

### 5. Cập nhật .env.local
```
VITE_MICROSOFT_CLIENT_ID=your_client_id_here
VITE_MICROSOFT_TENANT_ID=common
```

---

## Cấu trúc .env.local

```
# Google
VITE_GOOGLE_CLIENT_ID=abc123...xyz

# Microsoft  
VITE_MICROSOFT_CLIENT_ID=xyz789...abc
VITE_MICROSOFT_TENANT_ID=common
```

---

## Kiểm tra

1. Chạy ứng dụng: `npm run dev`
2. Nhấp vào nút "Đăng nhập"
3. Thử đăng nhập với Google hoặc Microsoft
4. Kiểm tra console nếu có lỗi

---

## Thông tin được lưu

Sau khi đăng nhập, thông tin sau sẽ được lưu trong `localStorage`:
- **ID người dùng**
- **Tên đầy đủ**
- **Email**
- **Ảnh đại diện** (Google)
- **Loại nhà cung cấp** (google/microsoft)

Dữ liệu này sẽ được sử dụng để:
- Hiển thị hồ sơ người dùng
- Lưu tiến độ dịch
- Đồng bộ hóa giữa các thiết bị
