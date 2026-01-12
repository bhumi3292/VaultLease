// src/components/auth/RegisterForm.jsx
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User, Mail, Phone, Lock, ChevronDown, Loader2, ShieldCheck, GraduationCap, Building } from 'lucide-react';
import { useRegisterUserTan } from '../../hooks/userRegisterUserTan.js';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


// Helper for input fields to reduce repetition
const InputField = ({ name, type = "text", placeholder, icon: Icon, error, touched, ...props }) => {
    // Rely on props passed from parent (value, onChange, onBlur)
    // Ensure name is passed back to input
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

export default function RegisterForm() {
    const navigate = useNavigate();
    const { mutate: registerUser, isPending } = useRegisterUserTan();

    const validationSchema = Yup.object({
        fullName: Yup.string().required("Full Name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        phoneNumber: Yup.string()
            .matches(/^\d{10}$/, "Phone number must be 10 digits")
            .required("Phone Number is required"),
        universityId: Yup.string().required("University ID is required"),
        stakeholder: Yup.string()
            .oneOf(["Administrator", "Student"], "Invalid role")
            .required("Role is required"),
        department: Yup.string().when('stakeholder', (stakeholder, schema) => {
            // Yup.when passes array of dependencies in new versions, checking first element
            // or just value if single dependency. Safest to handle both or debug.
            // Assuming stakeholder is the value here:
            return stakeholder[0] === 'Administrator'
                ? schema.required("Department is required for Administrators")
                : schema.nullable();
        }),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Confirm Password is required"),
    });

    const formik = useFormik({
        initialValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            universityId: "",
            stakeholder: "Student", // Default to Student
            department: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema,
        onSubmit: (values) => {
            registerUser(values, {
                onSuccess: (data) => {
                    toast.success(data?.message || "Registration successful!");
                    setTimeout(() => navigate("/login"), 1500);
                },
                onError: (error) => {
                    console.log(error)
                    toast.error(error?.response?.data?.message || "Registration failed");
                }
            });
        },
    });



    return (
        <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/40">
            <div className="p-8 pb-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#008080] mb-2 tracking-tight">Create Account</h2>
                    <p className="text-gray-500 text-sm">Join the VaultLease academic community</p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">

                    {/* Role Selection Tabs */}
                    <div className="bg-gray-100/50 p-1 rounded-xl flex mb-4">
                        <button
                            type="button"
                            onClick={() => formik.setFieldValue("stakeholder", "Student")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${formik.values.stakeholder === "Student"
                                ? "bg-white text-[#008080] shadow-sm transform scale-105"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => formik.setFieldValue("stakeholder", "Administrator")}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${formik.values.stakeholder === "Administrator"
                                ? "bg-white text-[#008080] shadow-sm transform scale-105"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Administrator
                        </button>
                    </div>

                    <InputField
                        name="fullName"
                        placeholder="Full Name"
                        icon={User}
                        value={formik.values.fullName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.fullName}
                        touched={formik.touched.fullName}
                    />

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

                    <InputField
                        name="phoneNumber"
                        type="tel"
                        placeholder="Phone Number"
                        icon={Phone}
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.phoneNumber}
                        touched={formik.touched.phoneNumber}
                    />

                    <InputField
                        name="universityId"
                        placeholder="University ID (e.g., STW2001)"
                        icon={GraduationCap}
                        value={formik.values.universityId}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.universityId}
                        touched={formik.touched.universityId}
                    />

                    {/* Department Field - Only visible for Administrators */}
                    {formik.values.stakeholder === 'Administrator' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <InputField
                                name="department"
                                placeholder="Department (e.g., Computer Science)"
                                icon={Building}
                                value={formik.values.department}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.department}
                                touched={formik.touched.department}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
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

                        <InputField
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm"
                            icon={Lock}
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.confirmPassword}
                            touched={formik.touched.confirmPassword}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#008080] hover:bg-[#006666] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#008080]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>
            </div>

            <div className="bg-gray-50/50 p-4 text-center border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#008080] font-semibold hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
