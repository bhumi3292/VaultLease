import React from "react";
import { ToastContainer } from "react-toastify";
import RegisterForm from "../components/auth/RegisterForm";
import "react-toastify/dist/ReactToastify.css";
// import logo from "../assets/logo.svg"; // Logo is now inside RegisterForm or Navbar, but we can keep a page background potentially

function Signup() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#F4F8F8] overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#008080]/10 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-[#C9A227]/10 rounded-full blur-[100px]" />
            </div>

            <ToastContainer position="top-right" autoClose={3000} />

            <div className="relative z-10 w-full flex justify-center">
                <RegisterForm />
            </div>
        </div>
    );
}

export default Signup;