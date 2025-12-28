// src/components/Navbar.jsx
import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Menu,
    X,
    User,
    LogOut,
    // ShoppingCart, // Disabled Cart
    Search,
    PlusCircle,
    Home,
    // Heart, // Disabled Cart
    ChevronDown,
    ClipboardList // For My Requests
} from "lucide-react";
import { AuthContext } from "../auth/AuthProvider.jsx";
import { toast } from "react-toastify";
// import { getCartService } from "../services/cartService"; // Disabled

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    // const [cartCount, setCartCount] = useState(0); 
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const profileMenuRef = useRef(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /* Cart Disabled
    useEffect(() => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }

        const fetchCartCount = async () => {
            try {
                const cartData = await getCartService();
                if (cartData && Array.isArray(cartData.items)) {
                    setCartCount(cartData.items.length);
                } else if (cartData && cartData.items && typeof cartData.items === 'object') {
                    setCartCount(Object.keys(cartData.items).length);
                } else {
                    setCartCount(0);
                }
            } catch (error) {
                console.error("Failed to fetch cart items:", error);
                setCartCount(0);
            }
        };

        fetchCartCount();
    }, [isAuthenticated, user]);
    */

    if (loading) return null;

    const handleLogout = () => {
        logout();
        toast.info("Logged out successfully");
        setMenuOpen(false);
        setProfileMenuOpen(false);
        navigate("/login");
    };

    const handleAssetClick = (e) => {
        e.preventDefault();
        setMenuOpen(false);
        if (user) {
            navigate("/assets");
        } else {
            toast.info("Please log in to view assets.");
            navigate("/login");
        }
    };

    const toggleProfileMenu = () => {
        setProfileMenuOpen(!profileMenuOpen);
    };

    const navLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `text-sm font-medium transition-all px-4 py-2 rounded-full ${isActive ? "bg-primary text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-primary"
            }`;
    };

    // Dynamic floating navbar classes
    const navbarClasses = `fixed top-4 left-0 right-0 z-50 transition-all duration-300 mx-auto max-w-6xl rounded-2xl ${scrolled
        ? "bg-white/95 backdrop-blur-md shadow-lg border border-gray-200/50 py-2 top-2"
        : "bg-white/90 backdrop-blur-sm shadow-sm py-3 border border-transparent"
        }`;

    return (
        <nav className={navbarClasses}>
            <div className="px-6">
                <div className="flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }}>
                        <div className="bg-gradient-to-br from-primary to-cyan-500 rounded-xl p-2 text-white shadow-lg group-hover:shadow-primary/30 transition-all">
                            <Home size={20} className="stroke-[2.5px]" />
                        </div>
                        <span className="text-xl font-bold text-gray-800 font-heading tracking-tight group-hover:text-primary transition-colors">VaultLease</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-full border border-gray-100">
                        <Link to="/" className={navLinkClass("/")}>Home</Link>

                        <a href="/assets" onClick={handleAssetClick} className={navLinkClass("/assets")}>
                            Assets
                        </a>

                        {(isAuthenticated && (user?.role === "ADMINISTRATOR" || user?.role === "ADMIN")) && (
                            <Link to="/add-asset" className={navLinkClass("/add-asset")}>
                                Manage Assets
                            </Link>
                        )}

                        {(isAuthenticated && user?.role === "ADMIN") && (
                            <Link to="/admin" className={navLinkClass("/admin")}>System Admin</Link>
                        )}

                        <Link to="/about" className={navLinkClass("/about")}>About</Link>
                    </div>

                    {/* Right Side Icons & Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Cart Button Removed */}

                        <div className="relative" ref={profileMenuRef}>
                            {isAuthenticated ? (
                                <button
                                    className="flex items-center gap-2 pl-3 py-1.5 pr-2 rounded-full border border-gray-200 hover:shadow-md transition-all bg-white"
                                    onClick={toggleProfileMenu}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                        {user?.fullName?.split(" ")[0]}
                                    </span>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="text-primary font-bold hover:text-secondary transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="bg-primary text-white px-5 py-2.5 rounded-full font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* Dropdown Menu */}
                            {isAuthenticated && profileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl py-2 z-50 border border-gray-100 ring-1 ring-black/5 animate-fade-in-up">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-sm font-bold text-gray-800 truncate">{user?.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        <p className="text-xs text-primary font-semibold uppercase mt-1">{user?.role}</p>
                                    </div>
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <User size={16} className="text-gray-400" /> My Profile
                                    </Link>
                                    <Link to="/my-requests" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <ClipboardList size={16} className="text-gray-400" /> My Requests
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                        <LogOut size={16} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-gray-600 p-2"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {menuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl p-4 flex flex-col gap-2 animate-fade-in-down h-screen z-40">
                    <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-lg">
                        <Home size={20} /> Home
                    </Link>
                    <a href="/assets" onClick={handleAssetClick} className="flex items-center gap-3 px-4 py-4 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-lg">
                        <Search size={20} /> Assets
                    </a>
                    {(isAuthenticated && (user?.role === "ADMINISTRATOR" || user?.role === "ADMIN")) && (
                        <Link to="/add-asset" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-4 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-lg">
                            <PlusCircle size={20} /> Manage Assets
                        </Link>
                    )}


                    <div className="mt-auto pb-24 space-y-4">
                        {!isAuthenticated ? (
                            <div className="flex flex-col gap-3">
                                <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 bg-gray-100 text-gray-800 font-bold rounded-xl text-lg">Log in</Link>
                                <Link to="/signup" onClick={() => setMenuOpen(false)} className="w-full text-center py-3 bg-primary text-white font-bold rounded-xl text-lg shadow-lg shadow-primary/20">Register</Link>
                            </div>
                        ) : (
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white bg-red-500 hover:bg-red-600 font-bold text-lg shadow-lg shadow-red-500/20">
                                <LogOut size={20} /> Log Out
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}