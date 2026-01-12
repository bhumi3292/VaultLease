// src/auth/AuthProvider.jsx
import React, { createContext, useState, useEffect } from "react";
import { getAuthUserApi } from '../api/authApi';

export const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = (userData) => {
        setLoading(true);
        try {
            if (userData) {
                // We no longer store token in localStorage manually.
                // It is handled by HTTP-only cookie.
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
                console.log("AuthContext: User logged in (cookie-based), setting user state to:", userData);
            }
        } catch (error) {
            console.error("AuthContext: Error in login:", error);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setLoading(true);
        localStorage.removeItem("user");
        // No need to remove token manually, backend handles cookie clearance.
        setUser(null);
        console.log("AuthContext: User logged out locally.");
        setLoading(false);
    };

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                // Try to restore user from localStorage first for speed
                const storedUserString = localStorage.getItem("user");
                if (storedUserString) {
                    setUser(JSON.parse(storedUserString));
                }

                // Verify with backend
                // This ensures the HTTP-only cookie is valid
                const { data } = await getAuthUserApi();
                if (data && data.success) {
                    setUser(data.user);
                    localStorage.setItem("user", JSON.stringify(data.user)); // Keep local text in sync
                    console.log("AuthContext: Session verified with backend.");
                } else {
                    throw new Error("Session verification failed");
                }
            } catch (error) {
                console.error("AuthContext: Session invalid/expired.", error);
                localStorage.removeItem("user");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
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