// src/routers/AppRouter.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider.jsx";

// Import your page components
import HomePage from "../pages/home.jsx";
import RegisterPage from "../pages/signup.jsx";
import LoginPage from "../pages/login.jsx";
import ForgetPasswordPage from "../pages/RequestPassword.jsx";
import ResetPasswordWithTokenPage from "../pages/ResetPassword.jsx";
import AgreementPage from "../pages/agreement.jsx";
import PropertyPage from "../pages/property.jsx";
import AddPropertyPage from "../pages/add_property.jsx";
import UpdatePropertyPage from "../pages/updatePropertyPage.jsx";
import PropertyDetail from "../pages/propertyDetails.jsx";
import CartPage from "../pages/cartProperty.jsx";
import ProfilePage from "../pages/profilePage.jsx";
import Booking_Details from "../pages/Booking_Details.jsx";
import Management from '../pages/Management.jsx';
import AboutUs from "../pages/AboutUs.jsx";
import ContactPage from "../pages/contactUs.jsx";
import ChatPage from '../components/ChatPage.jsx';
import OtpVerify from "../pages/OtpVerify.jsx";


const DashboardPage = () => <div className="p-4 text-xl">Welcome to the Dashboard! This is a protected page.</div>;
const NotFoundPage = () => <div className="p-4 text-xl text-red-500">404 - Page Not Found</div>;

// A wrapper component to protect routes
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    // Show a loading state while authentication is being checked.
    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading application...</div>;
    }

    // Redirect to the login page if the user is not authenticated.
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<OtpVerify />} />
            <Route path="/forgot-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordWithTokenPage />} />
            <Route path="/agreement" element={<AgreementPage />} />
            <Route path="/property" element={<PropertyPage />} />
            <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
            <Route path="/management" element={<PrivateRoute><Management /></PrivateRoute>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/booking_details" element={<Booking_Details />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/chat" element={<ChatPage />} />

            {/* Protected routes */}
            <Route
                path="/add-property"
                element={
                    <PrivateRoute>
                        <AddPropertyPage />
                    </PrivateRoute>
                }
            />

            <Route
                path="/update-property/:id"
                element={
                    <PrivateRoute>
                        <UpdatePropertyPage />
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


            {/* This route is not protected and can be accessed by anyone. */}
            <Route path="/property/:id" element={<PropertyDetail />} />

            {/* Catch-all route for 404 Not Found pages. */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}