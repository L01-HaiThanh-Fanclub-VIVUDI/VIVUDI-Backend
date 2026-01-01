#!/bin/bash
# Deploy script cho vivudi_be

# 1. Đi vào thư mục project
cd /var/www/VIVUDI-Backend || exit

# 2. Tắt PM2 tạm thời
pm2 stop vivudi_be

# 3. Lấy code mới từ git
git reset --hard
git pull origin main

# 4. Cài dependencies (npm install)
npm install

# 5. Build project
npm run build

# 6. Start PM2 với file main.js, giới hạn RAM
pm2 start dist/main.js --name vivudi_be --node-args="--max-old-space-size=512" --watch=false

# 7. Lưu config PM2 để tự động start sau reboot
pm2 save
