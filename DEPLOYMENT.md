# Rosys Billing SaaS - Production Deployment Guide

This guide details how to build, deploy, and monitor the **Rosys Billing SaaS** system in production environments.

---

## 1. Containerized Infrastructure [Docker Compose]
The application is pre-packaged with container rules. To launch all services (MySQL, Redis, Nginx, PHP API, Queue workers, and React SPA):

1. Adjust the production variables in `.env` inside `/backend`. Set `APP_ENV=production`, `APP_DEBUG=false`, and configure secure database credentials.
2. Build and launch the container cluster in detached mode:
   ```bash
   docker-compose up -d --build
   ```
3. Run migrations and cache configs inside the backend container:
   ```bash
   docker-compose exec backend php artisan migrate --force
   docker-compose exec backend php artisan config:cache
   docker-compose exec backend php artisan route:cache
   ```

---

## 2. Queue Management with Supervisor
Bulk PDF rendering and Excel imports run in background workers. The supervisor configuration in `supervisor.conf` monitors these workers inside the container:
- It launches 2 parallel processes (`numprocs=2`) to enable parallel PDF compilation.
- In case a worker crashes, Supervisor automatically restarts it (`autorestart=true`).
- Logs are written to `/var/www/storage/logs/worker.log`.

---

## 3. Reverse Nginx Configuration
The `nginx.conf` acts as the single web gateway:
- Routes matching `/api` are directed to PHP-FPM (`backend:9000`).
- All other routes are directed to the React frontend web server.
- Add standard SSL parameters (e.g. Let's Encrypt certificates) inside Nginx server blocks to enforce HTTPS.

---

## 4. AWS S3 Cloud Storage Integration
To store compiled invoice PDFs and bulk ZIPs in the cloud rather than on local disk:
1. Open `.env` in `/backend` and update the storage disk:
   ```env
   FILESYSTEM_DISK=s3
   ```
2. Insert your AWS IAM credentials:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_DEFAULT_REGION=us-east-1
   AWS_BUCKET=your_saas_bucket_name
   AWS_USE_PATH_STYLE_ENDPOINT=false
   ```
3. Laravel's storage adapters will automatically upload and stream all assets directly via secure AWS S3 pre-signed links.

---

## 5. Security Checklist
- Ensure `APP_DEBUG` is set to `false` in production.
- Generate a cryptographically secure key: `php artisan key:generate`.
- Set up MySQL database automated backups.
- Enable CORS policies inside Laravel (`config/cors.php`) restricting access strictly to your frontend domain.
