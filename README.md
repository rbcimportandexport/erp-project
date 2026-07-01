# RBC Import Export ERP

## Local Development

### 1. Start MongoDB

Use one of these options.

#### Option A: Docker

```powershell
cd "D:\RBC ERP SYSTEM IMPORT AND EXPORT\erp-project"
docker compose up -d
```

#### Option B: MongoDB Community Server

Install MongoDB Community Server, start the MongoDB service, and make sure it listens on:

```text
mongodb://127.0.0.1:27017
```

### 2. Start Backend

```powershell
cd "D:\RBC ERP SYSTEM IMPORT AND EXPORT\erp-project\backend"
npm.cmd run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 3. Start Frontend

```powershell
cd "D:\RBC ERP SYSTEM IMPORT AND EXPORT\erp-project\frontend"
npm.cmd run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

## Environment

Backend uses:

```text
backend/.env
```

Default local MongoDB URI:

```text
MONGO_URI=mongodb://127.0.0.1:27017/rbc_import_export_erp
```
