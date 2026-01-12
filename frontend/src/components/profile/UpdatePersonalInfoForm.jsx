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

    const InputField = ({ label, id, name, type = "text", placeholder, error }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                id={id}
                name={name}
                value={personalInfoForm[name]}
                onChange={handlePersonalInfoChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]/50 transition-all ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#008080]'
                    } bg-gray-50 focus:bg-white`}
                placeholder={placeholder}
                aria-invalid={error ? "true" : "false"}
            />
            {error && <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>}
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="p-2 bg-[#008080]/10 rounded-lg">
                    <Edit className="h-6 w-6 text-[#008080]" />
                </div>
                Update Personal Information
            </h2>
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Full Name"
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        error={errors.fullName}
                    />
                    <InputField
                        label="Email Address"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@university.edu"
                        error={errors.email}
                    />
                </div>
                <InputField
                    label="Phone Number (Optional)"
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    error={errors.phoneNumber}
                />

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        className="bg-[#008080] text-white px-8 py-3 rounded-lg shadow-lg shadow-[#008080]/20 hover:bg-[#006666] transition-all duration-300 font-bold
                                   disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transform hover:-translate-y-0.5"
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