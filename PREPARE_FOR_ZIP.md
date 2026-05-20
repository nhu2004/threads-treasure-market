# 📦 Hướng dẫn chuẩn bị dự án để zip

## 🚀 Cách sử dụng

### **Trên Windows (PowerShell)**
```powershell
powershell -ExecutionPolicy Bypass -File prepare-for-zip.ps1
```

### **Trên Windows (Command Prompt)**
```bash
prepare-for-zip.bat
```

### **Trên macOS / Linux / Git Bash**
```bash
bash prepare-for-zip.sh
```

---

## 📊 Dung lượng sẽ giảm

| Trước | Sau | Giảm |
|-------|-----|------|
| ~2,300 MB | ~150 MB | **93% ✨** |

---

## ✅ Các file/folder sẽ bị xóa

- `node_modules/` → Node.js dependencies (2,185 MB)
- `server/node_modules/` → Server dependencies (117 MB)
- `dist/` → Build output (0.72 MB)
- `bun.lock` → Bun package lock (0.20 MB)
- `bun.lockb` → Bun binary lock (0.23 MB)

---

## 📝 Sau khi giải nén project

```bash
# Cài lại dependencies
npm install

# Nếu cần, build lại project
npm run build

# Khởi động dev server
npm run dev
```

---

## ⚠️ Lưu ý

- `package.json` và `package-lock.json` **KHÔNG bị xóa** ✅
- Source code (`src/`, `server/`) **KHÔNG bị xóa** ✅
- Có thể khôi phục bất cứ lúc nào bằng `npm install` 🔄

---

## 🤖 Tự động hóa

Bạn cũng có thể chạy script này trực tiếp từ terminal:

```powershell
# PowerShell
& ".\prepare-for-zip.ps1"

# Command Prompt
call prepare-for-zip.bat

# Bash
./prepare-for-zip.sh
```
