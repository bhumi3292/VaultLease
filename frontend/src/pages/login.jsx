import React from "react";
import Navbar from "../layouts/Navbar";
import LoginForm from "../components/auth/LoginForm";

function Login() {
    return (
        <div className="min-h-screen bg-background font-body">
            <Navbar />
            <LoginForm />
        </div>
    );
}

export default Login;