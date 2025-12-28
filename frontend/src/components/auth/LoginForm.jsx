import React, { useContext, useState, useEffect } from 'react';
// Assuming useLoginUser is in useAuthHooks.js or a separate login hook
import { useLoginUser } from '../../hooks/useLoginUser.js'; // Adjust path if needed
import { verifyOtpApi } from '../../api/authApi.js';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from "../../assets/logo.svg"; // Updated to SVG logo // Adjust path if necessary
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider.jsx';
import { useMutation } from '@tanstack/react-query';
import { X, ShieldCheck, User } from 'lucide-react';


export default function LoginForm() {
    const { mutate, isLoading } = useLoginUser();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    // State for OTP
    const [showOtp, setShowOtp] = useState(false);
    const [tempUserId, setTempUserId] = useState(null);
    const [otpCode, setOtpCode] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [sendingOtp, setSendingOtp] = useState(false);

    // Timer for resend cooldown
    useEffect(() => {
        let interval;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    // Verify OTP Mutation
    // Auto-close OTP verification after 2 minutes
    useEffect(() => {
        if (!showOtp) return;
        const timer = setTimeout(() => {
            setShowOtp(false);
            toast.info('OTP verification time expired. Please request a new code.');
        }, 2 * 60 * 1000);
        return () => clearTimeout(timer);
    }, [showOtp]);
    const { mutate: verifyOtp, isLoading: isVerifying } = useMutation({
        mutationFn: async (vars) => {
            const response = await verifyOtpApi(vars);
            return response.data;
        },
        onSuccess: (data) => {
            if (data?.user && data?.token) {
                login(data.user, data.token);
                setShowOtp(false); // Close modal
                toast.success("Login Verified Successfully!");
                setTimeout(() => {
                    navigate("/");
                }, 300);
            }
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || "Invalid OTP. Please try again.";
            toast.error(errorMessage);
        }
    });

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().min(8, "Minimum 8 characters").required("Password is required"),
        // role was formerly stakeholder, but login doesn't really need role for authentication if backend handles it by email.
        // However, the backend loginUser logic DOES use `role` to distinguish (Wait, checking backend loginUser...)
        // Backend `loginUser` logic: `const { email, password } = req.body;` -> It does NOT use role for lookup anymore.
        // BUT `findUserIdByCredentials` DOES use `stakeholder`.
        // The `useLoginUser` hook calls `/api/auth/login`.
        // Let's check `authApi.js` or `useLoginUser.js`.
        // Assuming standard login just needs email/password.
        // BUT validaton schema here requires 'stakeholder'. 
        // We will remove the role selection from Login entirely as it's redundant unless emails can duplicate across roles (which we prevent).
        // OR we update it to show "User Role" for clarity if the API requires it.
        // The prompt implies the user sees "Landlord/Tenant" ON THE PAGE and wants it gone.
        // I will remove the radio buttons entirely if possible, or rename them effectively.
        // If the backend `loginUser` endpoint ignores it, we can remove it.
        // Let's keep it but rename to "Login As" for clarity if we want to be safe, or check if we can remove.
        // Checking backend `loginUser`: `const { email, password } = req.body;` -> It strictly uses email.
        // So we can Remove the role selection entirely from the UI!
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Email is required"),
            password: Yup.string().min(8, "Minimum 8 characters").required("Password is required"),
        }),
        onSubmit: (values) => {
            setSendingOtp(true);
            mutate(values, {
                onSuccess: (data) => {
                    setSendingOtp(false);
                    // Check for MFA requirement first.
                    const message = String(data?.message || '').toLowerCase();
                    const looksLikeOtp = /otp|verification code|verification|code sent|two[- ]factor/.test(message);
                    if (data?.mfaRequired || looksLikeOtp) {
                        setTempUserId(data.userId || data?.userId || data?.user?.id);
                        setShowOtp(true);
                        setResendCooldown(60);
                        toast.info(data.message || "OTP sent to email");
                        return;
                    }

                    if (data?.user && data?.token) {
                        login(data.user, data.token);
                        toast.success("Welcome back!");
                        setTimeout(() => {
                            navigate("/");
                        }, 300);
                    }
                },
                onError: (error) => {
                    setSendingOtp(false);
                    console.error("LoginForm: Login failed:", error);
                    const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
                    toast.error(errorMessage);
                },
            });
        },
    });

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        if (otpCode.length !== 6) {
            toast.warning("Please enter a valid 6-digit OTP.");
            return;
        }
        verifyOtp({ userId: tempUserId, otp: otpCode });
    };

    const handleResendOtp = () => {
        if (resendCooldown > 0) return;
        mutate(formik.values, {
            onSuccess: (data) => {
                if (data?.mfaRequired) {
                    setResendCooldown(60);
                    toast.success("Verification code resent successfully!");
                }
            },
            onError: () => toast.error("Failed to resend code.")
        });
    };

    return (
        <div className="min-h-screen bg-background font-body">
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-primary p-8 text-center text-white">
                        <h1 className="text-3xl font-bold font-heading mb-2">VaultLease Login</h1>
                        <p className="opacity-90">Secure Access to University Assets</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="p-8 space-y-6">

                        {/* Removed Role Selection - Login is email based */}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block font-bold text-gray-700 mb-1 text-sm">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block font-bold text-gray-700 mb-1 text-sm">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                            />
                            {formik.touched.password && formik.errors.password && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
                            )}
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-70">
                                {isLoading ? "Logging in..." : "Login"}
                            </button>
                            <div className="text-center mt-3">
                                <Link to="/forgot-password" className="text-primary font-bold hover:underline">Forgot Password?</Link>
                            </div>
                            {sendingOtp && !showOtp && (
                                <div className="mt-3 flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-5 h-5 border-2 border-primary rounded-full border-t-transparent animate-spin" />
                                        Sending verification code...
                                    </div>
                                </div>
                            )}
                            <p className="text-center text-gray-500 text-sm mt-6">
                                Don't have an account? <Link to="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
                            </p>
                        </div>

                    </form>
                </div>
            </div>
            {/* OTP Verification Modal */}
            {showOtp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-scale-up border border-white/20">
                        <button
                            onClick={() => setShowOtp(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Two-Factor Required</h2>
                            <p className="text-gray-500 text-center mt-2 text-sm">
                                We sent a verification code to <span className="font-bold text-gray-700">{formik.values.email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
                            <div>
                                <input
                                    id="otp"
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full py-4 text-center text-3xl font-bold tracking-[0.5em] text-gray-800 border-2 border-gray-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-gray-200"
                                    autoFocus
                                    maxLength={6}
                                />
                                <p className="text-xs text-center text-gray-400 mt-3">Enter the 6-digit code from your email</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isVerifying || otpCode.length !== 6}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98]"
                            >
                                {isVerifying ? "Verifying..." : "Verify Identity"}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resendCooldown > 0}
                                    className="text-primary text-sm font-bold hover:underline disabled:text-gray-400 disabled:no-underline"
                                >
                                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Verification Code"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}