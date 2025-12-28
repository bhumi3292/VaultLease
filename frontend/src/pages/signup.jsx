import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Lock, Hash, Building2 } from 'lucide-react';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        universityId: '',
        email: '',
        phoneNumber: '',
        role: 'STUDENT', // Default
        department: '', // Required for Administrator
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simple client validations
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', formData);
            if (response.data.success) {
                toast.success("Registration successful! Please login.");
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join VaultLese with your university credentials
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>

                    {/* Full Name & Uni ID */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><User size={16} /></span>
                                <input name="fullName" type="text" required value={formData.fullName} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm py-2 border" placeholder="John Doe" />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase">University ID</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Hash size={16} /></span>
                                <input name="universityId" type="text" required value={formData.universityId} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm py-2 border" placeholder="S123456" />
                            </div>
                        </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase">University Email</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={16} /></span>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm py-2 border" placeholder="john@uni.edu" />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Phone size={16} /></span>
                                <input name="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm py-2 border" placeholder="+1 234..." />
                            </div>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg border">
                            <option value="STUDENT">Requester (Student / Faculty)</option>
                            <option value="ADMINISTRATOR">Administrator (Staff / Lab Tech)</option>
                        </select>
                    </div>

                    {/* Department (If Admin) */}
                    {formData.role === 'ADMINISTRATOR' && (
                        <div className="relative animate-fade-in-down">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Building2 size={16} /></span>
                                <input name="department" type="text" required={formData.role === 'ADMINISTRATOR'} value={formData.department} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm py-2 border" placeholder="e.g. Physics Dept" />
                            </div>
                        </div>
                    )}

                    {/* Passwords */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={16} /></span>
                                <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm py-2 border" placeholder="••••••••" />
                            </div>
                        </div>
                        <div className="relative">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Confirm</label>
                            <div className="relative mt-1">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock size={16} /></span>
                                <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                                    className="pl-10 block w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm py-2 border" placeholder="••••••••" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${loading ? 'bg-primary/70' : 'bg-primary hover:bg-primary-hover'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg transition-all`}>
                            {loading ? "Registering..." : "Create Account"}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;