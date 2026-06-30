#!/bin/bash
set -euo pipefail
cd /var/www/rt05kampungmakasar

SECRET=$(openssl rand -base64 32)
cat > .env <<EOF
DATABASE_URL="file:./prod.db"
AUTH_SECRET="${SECRET}"
AUTH_URL="https://rt05kampungmakasar.web.id"
NODE_ENV=production
PORT=3010
EOF

export NODE_OPTIONS="--max-old-space-size=1024"
npm run db:setup
npm run build

echo "SETUP_OK"
