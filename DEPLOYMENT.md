# Chandarkant Jewellers Cloud — Production Deployment Guide

## 1. Cloud Infrastructure Overview

- **Frontend Hosting**: **Netlify**
  - Build command: `npm run build`
  - Publish directory: `dist`
  - SPA Routing: `/*  /index.html  200` rewrite in `_redirects`
- **Backend API Hosting**: **Render Web Service (PHP/Laravel)**
  - Environment: PHP 8.2+
  - Build command: `composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache`
  - Start command: `php artisan serve --host 0.0.0.0 --port $PORT`
- **Primary Database**: **Render PostgreSQL 16+**
  - High availability, SSL enabled, connection pooler

---

## 2. CI/CD & Production Build Steps

1. Push clean codebase to GitHub repository: `main` branch.
2. Configure environment variables on Render (backend) and Netlify (frontend).
3. Run initial migrations on Render PostgreSQL:
   ```bash
   php artisan migrate --force --seed
   ```
4. Verify HTTPS connectivity, CORS headers, and Sanctum cookies / bearer authorization.
