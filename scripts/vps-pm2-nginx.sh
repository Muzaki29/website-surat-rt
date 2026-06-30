#!/bin/bash
set -euo pipefail

APP_NAME="suratrt-rt05"
APP_DIR="/var/www/rt05kampungmakasar"
DOMAIN="rt05kampungmakasar.web.id"
PORT=3010

cd "$APP_DIR"

# PM2 — isolated process, port 3010 (tidak mengganggu web-syahdulab di 3000)
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 delete "$APP_NAME"
fi

pm2 start npm --name "$APP_NAME" --cwd "$APP_DIR" -- start -- -p "$PORT"
pm2 save

# Nginx — file baru saja, tidak menyentuh site lain
NGINX_AVAIL="/etc/nginx/sites-available/${DOMAIN}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"

cat > "$NGINX_AVAIL" <<'NGINX'
# SuratRT — RT 05 Kampung Makasar (port 3010)
# JANGAN edit file site lain di /etc/nginx/sites-available/

server {
    listen 80;
    listen [::]:80;
    server_name rt05kampungmakasar.web.id www.rt05kampungmakasar.web.id;

    client_max_body_size 15M;

    gzip on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3010;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINX

ln -sf "$NGINX_AVAIL" "$NGINX_ENABLED"

nginx -t
systemctl reload nginx

echo "PM2 and Nginx configured for ${DOMAIN} -> 127.0.0.1:${PORT}"
