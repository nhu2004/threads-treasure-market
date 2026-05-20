#!/bin/bash
# Script để chuẩn bị dự án trước khi zip
# Chạy: bash prepare-for-zip.sh

echo "🧹 Đang chuẩn bị dự án để zip..."
echo ""

# Danh sách folder/file cần xóa
items=(
    "node_modules"
    "server/node_modules"
    "dist"
    "bun.lock"
    "bun.lockb"
)

total_size=0

# Xóa từng item
for item in "${items[@]}"; do
    if [ -e "$item" ]; then
        if [ -d "$item" ]; then
            size=$(du -sh "$item" 2>/dev/null | cut -f1)
        else
            size=$(du -h "$item" 2>/dev/null | cut -f1)
        fi
        
        echo "❌ Xóa: $item ($size)"
        rm -rf "$item"
    else
        echo "⏭️  Không tìm thấy: $item"
    fi
done

echo ""
echo "✅ Hoàn thành!"
echo ""
echo "💡 Tiếp theo:"
echo "   1. Nén project bây giờ"
echo "   2. Khi giải nén, chạy: npm install"
echo "   3. Chạy: npm run build (nếu cần)"
