// src/components/auth/LoginForm.jsx
import React, { useContext } from 'react';
import { useLoginUser } from '../../hooks/useLoginUser.js';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../auth/AuthProvider.jsx';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';


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
                    if (data?.user && data?.token) {
                        login(data.user, data.token);
                        toast.success("Login successful!");
                        setTimeout(() => {
                            navigate("/");
                        }, 500);
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



    return (
        <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/40">
            <div className="p-8 pb-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#008080] mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-gray-500 text-sm">Sign in to access your VaultLease account</p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
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