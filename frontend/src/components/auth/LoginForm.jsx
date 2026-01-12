// src/components/auth/LoginForm.jsx
import React, { useContext, useState } from 'react';
import { useLoginUser } from '../../hooks/useLoginUser.js';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider.jsx';
import { Mail, Lock, Loader2, LogIn, KeyRound, ArrowLeft } from 'lucide-react';
import { verifyOtpApi, resendOtpApi } from '../../api/authApi.js';


// Helper for input fields
const InputField = ({ name, type = "text", placeholder, icon: Icon, error, touched, ...props }) => {
    const mergedProps = { name, type, placeholder, ...props };

    return (
        <div className="space-y-1">
            <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#008080] transition-colors pointer-events-none">
                    <Icon className="w-5 h-5" />
                </div>
                <input
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all duration-200 bg-white/50 focus:bg-white
                        ${touched && error
                            ? 'border-red-300 focus:ring-2 focus:ring-red-100'
                            : 'border-gray-200 focus:border-[#008080] focus:ring-4 focus:ring-[#008080]/10'
                        }`}
                    {...mergedProps}
                />
            </div>
            {touched && error && (
                <p className="text-red-500 text-xs pl-1">{error}</p>
            )}
        </div>
    );
};

export default function LoginForm() {
    // Attempt to handle both react-query versions of loading state for robustness
    const { mutate: loginMutate, isLoading, isPending } = useLoginUser();
    const loadingState = isPending || isLoading;

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    // Multi-step Login State
    const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
    const [tempUser, setTempUser] = useState(null); // { userId, email }
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().required("Password is required"),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema,
        onSubmit: (values) => {
            loginMutate(values, {
                onSuccess: (data) => {
                    // Check if OTP is required
                    if (data.requiresOtp) {
                        setTempUser({ userId: data.userId, email: data.email });
                        setStep('otp');
                        toast.info("OTP sent to your email!");
                    } else if (data?.user && data?.token) {
                        // Fallback purely for safety if backend turns off OTP
                        login(data.user, data.token);
                        toast.success("Login successful!");
                        setTimeout(() => navigate("/"), 500);
                    } else {
                        toast.error("Login failed: Invalid server response.");
                    }
                },
                onError: (error) => {
                    const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
                    toast.error(errorMessage);
                },
            });
        },
    });

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otpCode || otpCode.length < 6) {
            toast.warning("Please enter a valid 6-digit OTP.");
            return;
        }

        setOtpLoading(true);
        try {
            const response = await verifyOtpApi({ userId: tempUser.userId, otp: otpCode });
            const data = response.data;

            if (data.success) {
                // Token is now in HTTP-Only cookie, so we don't need to pass it manually.
                // Just update the user state in context.
                login(data.user);
                toast.success("Login successful!");
                setTimeout(() => navigate("/"), 500);
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            await resendOtpApi({ email: tempUser.email });
            toast.success("OTP resent successfully!");
        } catch (error) {
            toast.error("Failed to resend OTP");
        }
    };

    return (
        <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/40">
            <div className="p-8 pb-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#008080] mb-2 tracking-tight">
                        {step === 'credentials' ? "Welcome Back" : "Security Check"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {step === 'credentials'
                            ? "Sign in to access your VaultLease account"
                            : `Enter the OTP sent to ${tempUser?.email}`
                        }
                    </p>
                </div>

                {step === 'credentials' ? (
                    <form onSubmit={formik.handleSubmit} className="space-y-6 animate-in slide-in-from-left duration-300">
                        <InputField
                            name="email"
                            type="email"
                            placeholder="University Email"
                            icon={Mail}
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.email}
                            touched={formik.touched.email}
                        />

                        <div className="space-y-1">
                            <InputField
                                name="password"
                                type="password"
                                placeholder="Password"
                                icon={Lock}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.password}
                                touched={formik.touched.password}
                            />
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-[#008080] font-medium hover:underline hover:text-[#006666] transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loadingState}
                            className="w-full bg-[#008080] hover:bg-[#006666] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#008080]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loadingState ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right duration-300">
                        <div className="space-y-1">
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="Enter 6-digit OTP"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none transition-all duration-200 bg-white/50 focus:bg-white focus:border-[#008080] focus:ring-4 focus:ring-[#008080]/10 tracking-widest text-lg text-center font-bold text-[#008080]"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={otpLoading}
                            className="w-full bg-[#008080] hover:bg-[#006666] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#008080]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {otpLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify & Login"
                            )}
                        </button>

                        <div className="flex items-center justify-between text-sm">
                            <button
                                onClick={() => setStep('credentials')}
                                className="flex items-center text-gray-500 hover:text-gray-700 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                            </button>
                            <button
                                onClick={handleResendOtp}
                                className="text-[#008080] hover:underline font-semibold"
                            >
                                Resend OTP
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-50/50 p-4 text-center border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[#008080] font-semibold hover:underline">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
}