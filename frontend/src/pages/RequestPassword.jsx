import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation } from "@tanstack/react-query";
import { sendPasswordResetLinkService } from "../services/authService";
import logo from "../assets/logo.svg";

function ForgetPasswordPage() {
    const { mutate: sendLink, isLoading } = useMutation({
        mutationFn: sendPasswordResetLinkService,
        onSuccess: (data) => {
            toast.success(data?.message || "Reset link sent!");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to send reset link.");
        },
    });

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Email is required"),
        }),
        onSubmit: (values) => {
            sendLink(values);
        },
    });

    return (
        <div className="min-h-screen bg-[#F4F8F8] flex items-center justify-center p-4">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="bg-white p-8 rounded-[10px] shadow-lg w-full max-w-[420px] flex flex-col items-center">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="VaultLease Logo" className="h-14 mb-3" />
                    <h1 className="text-[24px] font-bold text-[#008080]">VaultLease</h1>
                    <p className="text-[#6B7280] text-sm">Reset Password</p>
                </div>

                <div className="w-full">
                    <h2 className="text-xl font-bold text-[#1F2933] mb-4 text-center">Forgot Password?</h2>
                    <p className="text-sm text-[#6B7280] text-center mb-6">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
                        <div className="text-left">
                            <label htmlFor="email" className="block text-sm font-medium text-[#1F2933] mb-1">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                className={`w-full p-3 border rounded-lg outline-none transition-all ${formik.touched.email && formik.errors.email
                                        ? 'border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]'
                                        : 'border-gray-300 focus:border-[#008080] focus:ring-1 focus:ring-[#008080]'
                                    }`}
                                placeholder="student@university.edu"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-[#B91C1C] text-xs mt-1">{formik.errors.email}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#008080] text-white h-[48px] rounded-lg font-semibold hover:bg-[#005F5F] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : "Send Reset Link"}
                        </button>

                        <div className="text-center mt-2">
                            <a href="/login" className="text-[#008080] font-medium hover:underline flex items-center justify-center gap-1">
                                ← Back to Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgetPasswordPage;
