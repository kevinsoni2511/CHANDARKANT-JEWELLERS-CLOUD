# Chandarkant Jewellers Cloud — Environment Variables Reference

## 1. Backend (`backend/.env`)

```ini
APP_NAME="Chandarkant Jewellers Cloud"
APP_ENV=production
APP_KEY=base64:GENERATE_WITH_ARTISAN
APP_DEBUG=false
APP_URL=https://api.chandarkantjewellers.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration (PostgreSQL 16+)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=chandarkant_jewellers_db
DB_USERNAME=jewellery_admin
DB_PASSWORD=Chandarkant@2026

# Queue & Cache
BROADCAST_CONNECTION=log
QUEUE_CONNECTION=database
CACHE_STORE=database
SESSION_DRIVER=database

# CORS Whitelist (Comma-separated)
CORS_ALLOWED_ORIGINS="http://localhost:5173,https://chandarkantjewellers.netlify.app"

# AI Integrations
OPENAI_API_KEY=
GEMINI_API_KEY=

# Bulk Messaging
WHATSAPP_CLOUD_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
SMS_DLT_API_KEY=
SMS_DLT_SENDER_ID=
```

## 2. Frontend (`frontend/.env`)

```ini
VITE_APP_NAME="Chandarkant Jewellers Cloud"
VITE_API_BASE_URL="http://127.0.0.1:8000/api/v1"
```
