import React, { useEffect } from "react";
import Navbar from "../layouts/Navbar";
import logo from "../assets/logo.svg";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';

import { useResetPassword } from '../hooks/useAuthHooks';

function ResetPasswordWithToken() {
    const { token } = useParams();
    const navigate = useNavigate();

    const { mutate: resetPasswordMutation, isLoading: isResetting } = useResetPassword();


    useEffect(() => {
        if (!token || token === 'undefined') {
            toast.error("Password reset link is missing or invalid. Please request a new one.");
            navigate('/forgot-password');
        }
    }, [token, navigate]);


    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            newPassword: Yup.string()
                .min(8, "New password must be at least 8 characters")
                .required("New password is required"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                .required('Confirm password is required'),
        }),
        onSubmit: (values) => {
            if (!token || token === 'undefined') { // Added 'token === 'undefined'' check again
                toast.error("Invalid reset link. Please request a new one.");
                navigate('/forgot-password');
                return;
            }
            console.log("Attempting to reset password with token:", token);
            resetPasswordMutation({
                token: token, // Pass the token from URL params
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            }, {
                onSuccess: (data) => {
                    toast.success(data.message || "Your password has been reset successfully!");
                    setTimeout(() => {
                        navigate('/login'); // Redirect to login page after successful reset
                    }, 1000);
                },
                onError: (error) => {
                    console.error("Failed to reset password:", error);
                    const errorMessage = error.response?.data?.message || error.message || "Failed to reset password. Please try again.";
                    toast.error(errorMessage);
                },
            });
        },
    });

    // Render a loading/redirecting message if no token is found initially
    if (!token || token === 'undefined') { // Added 'token === 'undefined'' check for initial render
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
                        <p className="text-xl text-red-600">Checking reset link...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
                    {/* Left Branding Section */}
                    <div className="w-full lg:w-2/5 bg-[#002B5B] text-white p-8 sm:p-10 flex flex-col items-center justify-center text-center rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
                        <img src={logo} alt="VaultLease Logo" className="w-24 h-24 mb-4 animate-bounce" />
                        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2">Set New Password</h2>
                        <p className="text-gray-200 text-base sm:text-lg max-w-xs">
                            Enter and confirm your new password below.
                        </p>
                    </div>

                    {/* Right Form Section */}
                    <div className="w-full lg:w-3/5 p-8 sm:p-10 flex flex-col justify-center">
                        <h1 className="text-3xl font-bold text-[#002B5B] mb-6 text-center">New Password</h1>
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="newPassword" className="sr-only">New Password</label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="New Password"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.newPassword}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition duration-150"
                                />
                                {formik.touched.newPassword && formik.errors.newPassword && (
                                    <p className="mt-2 text-sm text-red-600 text-left">{formik.errors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="sr-only">Confirm New Password</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm New Password"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.confirmPassword}
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-lg transition duration-150"
                                />
                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600 text-left">{formik.errors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isResetting || !formik.isValid || !formik.dirty}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-[#002B5B] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResetting ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default ResetPasswordWithToken;
