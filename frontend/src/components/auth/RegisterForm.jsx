import React, { useState } from 'react';
import { useRegisterUserTan } from '../../hooks/userRegisterUserTan.js';
import { toast } from 'react-toastify';


export default function RegisterForm() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        stakeholder: '',
        password: '',
        confirmPassword: ''
    });

    // Destructure mutate and isPending. 'data', 'error', 'isSuccess', 'isError' will be handled in callbacks.
    const { mutate, isPending } = useRegisterUserTan();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const { fullName, email, phoneNumber, stakeholder, password, confirmPassword } = formData;

        // Frontend Validation
        if (!fullName || !email || !phoneNumber || !stakeholder || !password || !confirmPassword) {
            toast.error("Please fill all the fields");
            return;
        }

        if (!["Landlord", "Tenant"].includes(stakeholder)) {
            toast.error("Stakeholder must be either 'Landlord' or 'Tenant'");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        // Call mutate with onSuccess and onError callbacks
        mutate(formData, {
            onSuccess: (data) => {
                // Display success toast with message from the backend or a default
                toast.success(data?.message || "Registration successful!");
                // Optionally clear the form after successful registration
                setFormData({
                    fullName: '',
                    email: '',
                    phoneNumber: '',
                    stakeholder: '',
                    password: '',
                    confirmPassword: ''
                });
            },
            onError: (error) => {
                // Display error toast with message from the backend or a default
                toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
            }
        });
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
                <input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} />
                <input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
                <select name="stakeholder" value={formData.stakeholder} onChange={handleChange}>
                    <option value="">Select Role</option>
                    <option value="Landlord">Administrator</option>
                    <option value="Tenant">Student</option>
                </select>
                <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                <input name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
                <button type="submit" disabled={isPending}>
                    {isPending ? 'Registering...' : 'Register'}
                </button>
            </form>

        </div>
    );
}