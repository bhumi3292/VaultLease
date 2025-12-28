// src/auth/AuthProvider.jsx
import React from 'react';
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (userData, token) => {
        setLoading(true);
        try {
            if (userData && token) {
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem("token", token);
                setUser(userData);
                console.log("AuthContext: User logged in, setting user state to:", userData);
            }
        } catch (error) {
            console.error("AuthContext: Failed to save user data to localStorage:", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setLoading(true);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        console.log("AuthContext: User logged out, user state set to null.");
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        const storedToken = localStorage.getItem("token");
        const storedUserString = localStorage.getItem("user");

        let parsedUser = null;

        if (storedToken && storedToken !== "undefined" && storedUserString && storedUserString !== "undefined") {
            try {
                parsedUser = JSON.parse(storedUserString);
                setUser(parsedUser);
                console.log("AuthContext: Initial load, user and token found. Setting user state.");
            } catch (error) {
                console.error("AuthContext: Error parsing user data from localStorage:", error);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
            }
        } else {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            console.log("AuthContext: Initial load, no valid user/token found in localStorage.");
        }

        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                setUser, // Crucial: setUser is exposed for direct updates from other components
                isAuthenticated: user !== null
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;