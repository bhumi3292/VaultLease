// src/components/profile/ChangePasswordForm.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { KeyRound } from "lucide-react";
import { useChangePassword } from "../../hooks/useAuthHooks";

export default function ChangePasswordForm() {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [errors, setErrors] = useState({});

    const { mutate: changePassword, isLoading: isChangingPassword } = useChangePassword();

    const validateForm = () => {
        let newErrors = {};
        if (!passwordForm.currentPassword) {
            newErrors.currentPassword = "Current password is required.";
        }
        if (!passwordForm.newPassword) {
            newErrors.newPassword = "New password is required.";
        } else if (passwordForm.newPassword.length < 8) {
            newErrors.newPassword = "New password must be at least 8 characters.";
        }
        if (!passwordForm.confirmNewPassword) {
            newErrors.confirmNewPassword = "Confirm new password is required.";
        } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            newErrors.confirmNewPassword = "New password and confirmation do not match.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleChangePasswordSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please correct the errors in the form.");
            return;
        }

        changePassword(passwordForm, {
            onSuccess: (response) => {
                if (response.success) {
                    toast.success(response.message || "Password changed successfully!");
                    setPasswordForm({ // Clear form after success
                        currentPassword: "",
                        newPassword: "",
                        confirmNewPassword: "",
                    });
                    setErrors({}); // Clear any lingering errors
                } else {
                    toast.error(response.message || "Failed to change password.");
                }
            },
            onError: (err) => {
                const errorMessage = err.response?.data?.message || err.message || "Error changing password.";
                toast.error(errorMessage);
                console.error("Change Password Error:", err);
            }
        });
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <KeyRound className="h-7 w-7 text-[#003366]" /> Change Password
            </h2>
            <form onSubmit={handleChangePasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] ${
                            errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        } transition duration-200 ease-in-out`}
                        placeholder="Enter current password"
                        aria-invalid={errors.currentPassword ? "true" : "false"}
                        aria-describedby={errors.currentPassword ? "currentPassword-error" : undefined}
                    />
                    {errors.currentPassword && (
                        <p id="currentPassword-error" className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] ${
                            errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        } transition duration-200 ease-in-out`}
                        placeholder="Enter new password (min 8 chars)"
                        aria-invalid={errors.newPassword ? "true" : "false"}
                        aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                    />
                    {errors.newPassword && (
                        <p id="newPassword-error" className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={passwordForm.confirmNewPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003366] ${
                            errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'
                        } transition duration-200 ease-in-out`}
                        placeholder="Confirm new password"
                        aria-invalid={errors.confirmNewPassword ? "true" : "false"}
                        aria-describedby={errors.confirmNewPassword ? "confirmNewPassword-error" : undefined}
                    />
                    {errors.confirmNewPassword && (
                        <p id="confirmNewPassword-error" className="mt-1 text-sm text-red-600">{errors.confirmNewPassword}</p>
                    )}
                </div>
                <div className="md:col-span-2 flex justify-end mt-4">
                    <button
                        type="submit"
                        className="bg-[#003366] text-white px-8 py-3 rounded-lg shadow-lg hover:bg-[#002244] transition-all duration-300 ease-in-out font-semibold text-lg
                                   disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={isChangingPassword}
                    >
                        {isChangingPassword ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></span>
                                Changing...
                            </>
                        ) : (
                            'Change Password'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}