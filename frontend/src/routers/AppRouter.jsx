// src/routers/AppRouter.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider.jsx";

// Import your page components
import HomePage from "../pages/home.jsx";
import RegisterPage from "../pages/signup.jsx";
import LoginPage from "../pages/login.jsx";
import ForgetPasswordPage from "../pages/ForgetPassword.jsx";
import ResetPasswordWithTokenPage from "../pages/ResetPassword.jsx";
import AgreementPage from "../pages/agreement.jsx";
import AssetsPage from "../pages/Assets.jsx"; // Renamed from property.jsx
import AddAssetPage from "../pages/AddAsset.jsx"; // Renamed from add_property.jsx
import UpdateAssetPage from "../pages/UpdateAsset.jsx"; // Renamed from updatePropertyPage.jsx
import AssetDetail from "../pages/AssetDetails.jsx"; // Renamed from propertyDetails.jsx
// import CartPage from "../pages/cartProperty.jsx"; // Disabled
import AdminDashboard from "../pages/AdminDashboard.jsx";
import ProfilePage from "../pages/profilePage.jsx";
import MyRequestsPage from "../pages/MyRequests.jsx"; // Renamed from Booking_Details.jsx
import AboutUs from "../pages/AboutUs.jsx";
import ContactPage from "../pages/contactUs.jsx";
import ChatPage from '../components/ChatPage.jsx';


const DashboardPage = () => <div className="p-4 text-xl">Welcome to the Dashboard! This is a protected page.</div>;
const NotFoundPage = () => <div className="p-4 text-xl text-red-500">404 - Page Not Found</div>;

// A wrapper component to protect routes and handle RBAC
const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, loading, user } = useContext(AuthContext);

    // Show a loading state while authentication is being checked.
    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading application...</div>;
    }

    // Redirect to the login page if the user is not authenticated.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role-Based Access Control
    if (allowedRoles && user && user.role) {
        const userRole = user.role.toUpperCase();
        const roles = allowedRoles.map(r => r.toUpperCase());
        if (!roles.includes(userRole)) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">You do not have permission to view this page.</p>
                    <a href="/" className="text-primary hover:underline">Go back to Home</a>
                </div>
            );
        }
    }

    return children;
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordWithTokenPage />} />
            <Route path="/agreement" element={<AgreementPage />} />

            {/* Asset Routes */}
            <Route path="/assets" element={<AssetsPage />} />
            {/* <Route path="/cart" element={<CartPage />} /> */}

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-requests" element={<MyRequestsPage />} />

            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/chat" element={<ChatPage />} />

            {/* Protected routes */}
            <Route
                path="/add-asset"
                element={
                    <PrivateRoute allowedRoles={['ADMINISTRATOR', 'ADMIN']}>
                        <AddAssetPage />
                    </PrivateRoute>
                }
            />

            <Route
                path="/update-asset/:id"
                element={
                    <PrivateRoute allowedRoles={['ADMINISTRATOR', 'ADMIN']}>
                        <UpdateAssetPage />
                    </PrivateRoute>
                }
            />

            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <DashboardPage />
                    </PrivateRoute>
                }
            />

            <Route
                path="/admin"
                element={
                    <PrivateRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </PrivateRoute>
                }
            />


            {/* This route is not protected and can be accessed by anyone. */}
            <Route path="/assets/:id" element={<AssetDetail />} />

            {/* Catch-all route for 404 Not Found pages. */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}