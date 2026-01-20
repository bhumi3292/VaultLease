# VaultLease

**VaultLease** is a comprehensive university resource management and reservation system designed to streamline the booking of department rooms, labs, and shared facilities. It empowers students, faculty, and administrators to efficiently manage campus spaces, replacing outdated manual scheduling with a modern, digital solution.

## 🚀 Project Overview

VaultLease addresses the complexities of campus resource allocation by providing a centralized platform where:
*   **Students & Staff** can easily discover and book available rooms, labs, or equipment.
*   **Department Admins** can manage inventory, approve requests, and track usage.
*   **University Administration** gets insights into space utilization and security compliance.

The system is built with a focus on **security**, **usability**, and **performance**, ensuring a seamless experience for the entire university community.

## ✨ Key Features

*   **Smart Reservation System**: Real-time availability checking and conflict-free booking for classrooms, labs, and event spaces.
*   **Role-Based Access Control (RBAC)**: secure environments for Students, Faculty, and Administrators with granular permission levels.
*   **VaultBot AI Assistant**: An integrated AI chatbot (powered by Google Gemini) to assist users in finding rooms and answering queries 24/7.
*   **Interactive Maps**: Location-based search to help users find facilities across campus.
*   **Secure Authentication**: robust user verification using JWT, bcrypt password hashing, and OTP email verification.
*   **Administrative Dashboard**: Comprehensive analytics, audit logs, and user management tools for system administrators.
*   **Reviews & Ratings**: Feedback system for users to rate the condition and facilities of booked spaces.

## 🛠️ Technology Stack

This project utilizes a modern MERN architecture:

*   **Frontend**: React.js (v19), Vite, TailwindCSS
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **AI Integration**: Google Gemini API
*   **Security**: Helmet, Rate Limiting, xss-clean, hpp
*   **Real-time Communication**: Socket.io

## 📦 Getting Started

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/VaultLease.git
    cd VaultLease
    ```

2.  **Install Dependencies**
    *   Backend:
        ```bash
        cd backend
        npm install
        ```
    *   Frontend:
        ```bash
        cd ../frontend
        npm install
        ```

3.  **Environment Setup**
    Create `.env` files in both `backend` and `frontend` directories with the necessary configuration (Database URI, API Keys, etc.).

4.  **Run the Application**
    *   Start Backend: `npm run dev` (in `backend/`)
    *   Start Frontend: `npm run dev` (in `frontend/`)

## 🔒 Security

VaultLease adheres to "Security by Design" principles, implementing strict input validation, data sanitization, and secure transmission protocols to protect sensitive university data.

---

*Note: This project is developed for academic purposes to demonstrate modern web application development and security practices.*
