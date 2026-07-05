# Rosys Billing SaaS - Local Installation Guide

This guide describes how to run and test the **Rosys Billing SaaS** application in a local developer environment.

---

## Prerequisites
1. **PHP 8.3** (or later) - Ext loaded: `gd`, `zip`, `pdo_mysql`, `bcmath`, `mbstring`.
2. **Node.js v24** and **npm v11** (or compatible newer versions).
3. **WampServer** (or a local MySQL 8.x database server).

---

## Step 1: Start MySQL Database
WampServer provides the MySQL daemon. To start it manually without elevated services privileges:
1. Locate the MySQL ini configuration `c:\wamp64\bin\mysql\mysql8.4.7\my.ini` (or corresponding path).
2. Start the daemon in a background shell:
   ```bash
   c:\wamp64\bin\mysql\mysql8.4.7\bin\mysqld.exe --defaults-file=c:\wamp64\bin\mysql\mysql8.4.7\my.ini
   ```
3. Create the database:
   ```bash
   c:\wamp64\bin\mysql\mysql8.4.7\bin\mysql.exe -h 127.0.0.1 -u root -e "CREATE DATABASE IF NOT EXISTS rosys_billing_saas;"
   ```

---

## Step 2: Configure and Seed Backend API
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Double-check your `.env` configuration. Ensure the database parameters match:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=rosys_billing_saas
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Run the migrations and seed data (creates default subscription plans, companies, and role-based test user credentials):
   ```bash
   php artisan migrate --seed
   ```
4. Create the symbolic link for accessible asset streaming:
   ```bash
   php artisan storage:link
   ```

---

## Step 3: Run the Queue Worker
PDF merging and spreadsheet parsing run asynchronously in background queues. Launch a queue worker to listen for incoming generation jobs:
```bash
php artisan queue:work --sleep=3 --tries=3
```

---

## Step 4: Run the Backend API Server
Launch the local Laravel PHP server:
```bash
php artisan serve --port=8000
```
The API is now active at `http://127.0.0.1:8000`.

---

## Step 5: Start the React Frontend SPA
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
The frontend is now available at `http://127.0.0.1:5173`.

---

## Step 6: Test the Billing System
1. Open `http://127.0.0.1:5173` in your browser.
2. Sign in using one of the seeded credentials:
   - **Role: Vendor Admin**
     - Email: `admin@rosys.com`
     - Password: `password`
   - **Role: Staff Operator**
     - Email: `staff@rosys.com`
     - Password: `password`
   - **Role: Viewer Guest**
     - Email: `viewer@rosys.com`
     - Password: `password`
   - **Role: Global Super Admin**
     - Email: `superadmin@rosys.com`
     - Password: `password`
3. Download the `Sample_Invoices.xlsx` file located at the root of this workspace.
4. Navigate to the **Invoice Generator** tab, drag and drop the Excel file, examine the instant local data preview, check for asset warnings, and click **Compile Bulk Invoices**.
5. You will be redirected to the **History Logs** screen where you can watch the processing state transition to `completed` in real-time. Click **PDF** or **ZIP** to download the results.
