# VaultLease Backend API

## Overview
This is the NodeJS/Express backend for the VaultLease asset leasing platform. It handles authentication, asset management, and booking logic.

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/vaultlease_dev_db
   JWT_SECRET=your_super_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/request-reset/send-link` - Forgot password
- `PUT /api/auth/update-profile` - Update profile info

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - List new property (Landlord only)
- `PUT /api/properties/:id` - Update property (Owner only)
