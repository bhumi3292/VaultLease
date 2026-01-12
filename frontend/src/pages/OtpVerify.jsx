import React, { useState, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";

function OtpVerify() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (index > 0 && !otp[index]) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            pastedData.split("").forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);
            // Focus last filled or next empty
            const nextEmpty = newOtp.findIndex(val => val === "");
            const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
            inputRefs.current[focusIndex].focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP.");
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log("Verifying OTP:", otpCode);
            // Mock success
            setIsLoading(false);
            toast.success("OTP Verified Successfully!");
            setTimeout(() => {
                navigate("/login"); // Or dashboard
            }, 1000);
        }, 1500);
    };

    const handleResend = () => {
        toast.info("Resending OTP...");
        // Implement resend logic here
    };

    return (
        <div className="min-h-screen bg-[#F4F8F8] flex items-center justify-center p-4">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="bg-white p-8 rounded-[10px] shadow-lg w-full max-w-[420px] flex flex-col items-center">
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <img src={logo} alt="VaultLease Logo" className="h-14 mb-3" />
                    <h1 className="text-[24px] font-bold text-[#008080]">VaultLease</h1>
                    <p className="text-[#6B7280] text-sm">Verify your account</p>
                </div>

                <div className="w-full">
                    <h2 className="text-xl font-bold text-[#1F2933] mb-4 text-center">Enter OTP</h2>
                    <p className="text-sm text-[#6B7280] text-center mb-8">
                        We've sent a 6-digit code to your email. Please enter it below to verify your identity.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex justify-between gap-2">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    name="otp"
                                    maxLength="1"
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#008080] transition-all bg-[#F9FAFB]"
                                />
                            ))}
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
                            ) : "Verify"}
                        </button>

                        <div className="text-center mt-2">
                            <p className="text-sm text-[#6B7280]">
                                Didn't receive the code?
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className="text-[#008080] font-semibold ml-1 hover:underline bg-transparent border-none cursor-pointer"
                                >
                                    Resend OTP
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default OtpVerify;
