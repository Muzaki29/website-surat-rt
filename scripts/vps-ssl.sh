#!/bin/bash
# Jalankan SETELAH DNS A record mengarah ke VPS (103.235.72.55)
set -euo pipefail
DOMAIN="rt05kampungmakasar.web.id"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m rt005rw002.makasar@gmail.com --redirect
systemctl reload nginx
echo "SSL aktif untuk https://${DOMAIN}"
