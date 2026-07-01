# CS2 Tactics Board — Desktop (Windows)

App quản lý chiến thuật CS2 theo map, chạy như một chương trình Windows bình
thường (không cần Claude, không cần internet để dùng — chỉ cần internet khi
kiểm tra bản cập nhật). Dữ liệu lưu trực tiếp trên máy người dùng.

Tài liệu này hướng dẫn từ **con số 0**: cài môi trường, chạy thử, đóng gói ra
file cài đặt `.exe`, tạo GitHub repo, và cách phát hành bản cập nhật mới để
người khác tự tải về.

---

## 0. Chuẩn bị (làm 1 lần)

1. Cài **Node.js** (bản LTS): https://nodejs.org — cài xong mở
   `cmd`/`PowerShell` gõ `node -v` thấy ra số phiên bản là được.
2. Cài **Git**: https://git-scm.com/downloads
3. Có tài khoản **GitHub** (nếu chưa có, đăng ký tại https://github.com).

---

## 1. Cài dự án và chạy thử trên máy

Mở terminal (cmd/PowerShell) tại thư mục vừa giải nén project này:

```bash
npm install
npm run electron:dev
```

Lệnh trên sẽ mở cửa sổ app y hệt bản bạn đã dùng trên Claude, nhưng chạy như
một app Windows thật, dữ liệu lưu vào một file JSON trên máy bạn (không mất
khi tắt app). Lần đầu chạy sẽ tự có sẵn 2 chiến thuật mẫu ở map Dust2 giống
bản bạn đang test.

> Sửa code trong `src/App.jsx` xong thì chỉ cần lưu file, app tự load lại.

---

## 2. Đóng gói ra file cài đặt `.exe` (chạy thử trước khi phát hành)

```bash
npm run electron:build
```

File cài đặt sẽ nằm trong thư mục `release/`, ví dụ
`CS2 Tactics Board Setup 1.0.0.exe`. Bạn có thể chạy thử file này để cài vào
máy như một app bình thường.

> Vì app chưa có chữ ký số (code signing) nên Windows SmartScreen có thể cảnh
> báo "Windows protected your PC" khi cài lần đầu — bấm **More info → Run
> anyway** là được. Đây là điều bình thường với app cá nhân chưa mua chứng
> chỉ ký số.

---

## 3. Tạo GitHub repo cho dự án

1. Vào https://github.com/new, đặt tên repo (ví dụ `cs2-tactics-board`),
   chọn **Public** (bắt buộc Public nếu muốn người khác tải bản cài đặt miễn
   phí từ GitHub Releases), bấm **Create repository**.
2. Trong thư mục dự án, chạy:

```bash
git init
git add .
git commit -m "Khởi tạo CS2 Tactics Board"
git branch -M main
git remote add origin https://github.com/TEN_TAI_KHOAN/cs2-tactics-board.git
git push -u origin main
```

(thay `TEN_TAI_KHOAN` và tên repo bằng đúng của bạn)

3. Mở file `package.json`, sửa 2 dòng trong mục `"publish"`:

```json
"publish": [
  {
    "provider": "github",
    "owner": "TEN_TAI_KHOAN",
    "repo": "cs2-tactics-board"
  }
]
```

Commit và push lại thay đổi này.

---

## 4. Phát hành bản đầu tiên (và mọi bản cập nhật sau này)

Mỗi khi bạn sửa xong app và muốn phát hành bản mới để mọi người tải:

```bash
npm version patch    # 1.0.0 -> 1.0.1 (sửa lỗi nhỏ)
# hoặc: npm version minor   (1.0.0 -> 1.1.0, thêm tính năng)
# hoặc: npm version major   (1.0.0 -> 2.0.0, thay đổi lớn)

git push --follow-tags
```

Lệnh `npm version` tự tăng số phiên bản trong `package.json` và tạo một tag
git (vd `v1.0.1`). Khi bạn `git push --follow-tags`, GitHub Actions
(đã cấu hình sẵn ở `.github/workflows/release.yml`) sẽ **tự động**:

1. Build lại app
2. Đóng gói file `.exe`
3. Tạo bản Release mới trên GitHub kèm file cài đặt

Bạn không cần làm gì thêm — chỉ cần vào tab **Actions** trên GitHub để xem
tiến trình build (mất khoảng 3–5 phút).

### Người dùng nhận app mới thế nào?

- **Lần đầu cài**: gửi họ link
  `https://github.com/TEN_TAI_KHOAN/cs2-tactics-board/releases/latest`,
  họ tải file `.exe` và cài như bình thường.
- **Từ lần 2 trở đi**: không cần gửi lại link — mỗi khi mở app, app tự kiểm
  tra GitHub Releases, nếu có bản mới sẽ tự tải ngầm và hỏi người dùng có
  muốn khởi động lại để cập nhật không (nhờ `electron-updater`).

---

## 5. Cấu trúc dự án

```
cs2-tactics-desktop/
├─ electron/
│  ├─ main.js        # Tiến trình chính: mở cửa sổ, lưu file JSON, auto-update
│  └─ preload.js     # Cầu nối an toàn, cấp window.storage cho giao diện
├─ src/
│  ├─ App.jsx        # Toàn bộ giao diện (y hệt bản trên Claude)
│  └─ main.jsx       # Điểm khởi động React
├─ seed/
│  └─ default-data.json  # Dữ liệu mẫu nạp sẵn lần đầu cài (map Dust2)
├─ .github/workflows/release.yml  # Tự build + publish khi push tag
├─ package.json      # Cấu hình app, script, electron-builder
└─ vite.config.js
```

---

## Lưu ý quan trọng

- **Ảnh đã upload trong lúc test trên Claude chưa có trong file mẫu này.**
  Những ảnh đó được lưu trong phiên làm việc trên Claude.ai, mình không lấy
  ra được để đóng gói cùng. Phần **văn bản, video, tên chiến thuật** thì đã
  đóng gói đầy đủ y hệt bảng gốc bạn gửi. Bạn có thể mở app, vào "Sửa chiến
  thuật" và tải lại ảnh cho từng role như bình thường.
- Sau khi cài, dữ liệu lưu tại:
  `%APPDATA%\cs2-tactics-board\store.json` (Windows) — có thể sao lưu file
  này để chuyển dữ liệu sang máy khác.
- Muốn đổi icon app: thêm file `build/icon.ico` (256x256) rồi thêm dòng
  `"icon": "build/icon.ico"` vào mục `"win"` trong `package.json`.
