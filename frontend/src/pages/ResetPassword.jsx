import React, { useEffect } from "react";
import Navbar from "../layouts/Navbar.jsx";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck } from "lucide-react";
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
            if (!token || token === 'undefined') {
                toast.error("Invalid reset link. Please request a new one.");
                navigate('/forgot-password');
                return;
            }
            resetPasswordMutation({
                token: token,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            }, {
                onSuccess: (data) => {
                    toast.success(data.message || "Your password has been reset successfully!");
                    setTimeout(() => {
                        navigate('/login');
                    }, 1000);
                },
                onError: (error) => {
                    const errorMessage = error.response?.data?.message || error.message || "Failed to reset password. Please try again.";
                    toast.error(errorMessage);
                },
            });
        },
    });

    if (!token || token === 'undefined') {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
                        <p className="text-xl text-state-error">Checking reset link...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-body">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-md w-full border border-gray-100">
                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 font-heading">Secure Your Account</h2>
                            <p className="text-gray-500 mt-2 text-sm">Create a new strong password for your VaultLease account.</p>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.newPassword}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-gray-50 focus:bg-white"
                                />
                                {formik.touched.newPassword && formik.errors.newPassword && (
                                    <p className="mt-1 text-xs text-state-error font-medium">{formik.errors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.confirmPassword}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-gray-50 focus:bg-white"
                                />
                                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-state-error font-medium">{formik.errors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isResetting || !formik.isValid || !formik.dirty}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <KeyRound size={20} />
                                {isResetting ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default ResetPasswordWithToken;
