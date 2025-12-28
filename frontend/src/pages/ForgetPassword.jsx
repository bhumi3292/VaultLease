import React from "react";
import Navbar from "../layouts/Navbar";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSendPasswordResetLink } from '../hooks/useAuthHooks';
import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

function ForgetPassword() {
    const { mutate: sendLinkMutation, isLoading: isSendingLink } = useSendPasswordResetLink();

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Email is required"),
        }),
        onSubmit: (values) => {
            sendLinkMutation(values, {
                onSuccess: (data) => {
                    toast.success(data.message || "Password reset link sent to your email!");
                    formik.resetForm();
                },
                onError: (error) => {
                    const errorMessage = error.response?.data?.message || "Failed to send reset link.";
                    toast.error(errorMessage);
                },
            });
        },
    });

    return (
        <div className="min-h-screen bg-background font-body">
            <Navbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">

                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                        <KeyRound size={32} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 mb-8 text-sm">
                        No worries, we'll send you reset instructions.
                    </p>

                    <form onSubmit={formik.handleSubmit} className="space-y-6 text-left">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                {...formik.getFieldProps('email')}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="mt-1 text-sm text-red-500">{formik.errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSendingLink || !formik.isValid || !formik.dirty}
                            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            {isSendingLink ? "Sending Link..." : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
                            ← Back to log in
                        </Link>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default ForgetPassword;
