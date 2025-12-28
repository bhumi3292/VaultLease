// src/components/profile/UpdatePersonalInfoForm.jsx
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { Edit } from "lucide-react";
import { AuthContext } from "../../auth/AuthProvider";
import { useUpdateProfile } from "../../hooks/useAuthHooks";

export default function UpdatePersonalInfoForm() {
    const { user, setUser } = useContext(AuthContext);
    const [personalInfoForm, setPersonalInfoForm] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
    });
    const [errors, setErrors] = useState({});

    const { mutate: updateProfile, isLoading: isUpdatingProfile } = useUpdateProfile();

    useEffect(() => {
        if (user) {
            setPersonalInfoForm({
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
            });
        }
    }, [user]);

    const validateForm = () => {
        let newErrors = {};
        if (!personalInfoForm.fullName.trim()) {
            newErrors.fullName = "Full name is required.";
        }
        if (!personalInfoForm.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(personalInfoForm.email)) {
            newErrors.email = "Email address is invalid.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePersonalInfoChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfoForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handlePersonalInfoSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please correct the errors in the form.");
            return;
        }

        updateProfile(personalInfoForm, {
            onSuccess: (response) => {
                if (response.success && response.user) {
                    setUser(response.user);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    toast.success("Profile updated successfully!");
                } else {
                    toast.error(response.message || "Failed to update profile.");
                }
            },
            onError: (err) => {
                const errorMessage = err.response?.data?.message || err.message || "Error updating profile.";
                toast.error(errorMessage);
                console.error("Update Profile Error:", err);
            }
        });
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <Edit className="h-7 w-7 text-[#003366]" /> Update Personal Information
            </h2>
            <form onSubmit={handlePersonalInfoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={personalInfoForm.fullName}
                        onChange={handlePersonalInfoChange}
                        className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] ${
                            errors.fullName ? 'border-red-500' : 'border-gray-300'
                        } transition duration-200 ease-in-out`}
                        placeholder="Your full name"
                        aria-invalid={errors.fullName ? "true" : "false"}
                        aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    />
                    {errors.fullName && (
                        <p id="fullName-error" className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={personalInfoForm.email}
                        onChange={handlePersonalInfoChange}
                        className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                        } transition duration-200 ease-in-out`}
                        placeholder="your@email.com"
                        aria-invalid={errors.email ? "true" : "false"}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={personalInfoForm.phoneNumber}
                        onChange={handlePersonalInfoChange}
                        className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] ${
                            errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        } transition duration-200 ease-in-out`}
                        placeholder="e.g., 98XXXXXXXX"
                        aria-invalid={errors.phoneNumber ? "true" : "false"}
                        aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
                    />
                    {errors.phoneNumber && (
                        <p id="phoneNumber-error" className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                </div>
                <div className="md:col-span-2 flex justify-end mt-4">
                    <button
                        type="submit"
                        className="bg-[#003366] text-white px-8 py-3 rounded-lg shadow-lg hover:bg-[#002244] transition-all duration-300 ease-in-out font-semibold text-lg
                                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={isUpdatingProfile}
                    >
                        {isUpdatingProfile ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}