// src/components/Navbar.jsx
import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";
import { ShoppingCart, Menu, X, ChevronDown, User, LogOut, Building, Calendar } from "lucide-react";
import { AuthContext } from "../auth/AuthProvider.jsx";
import { toast } from "react-toastify";
import { getCartService } from "../services/cartService";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    const { isAuthenticated, user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const profileMenuRef = useRef(null);

    // Handle scroll effect for slight transparency/size adjustment
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handle click outside profile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch cart count
    useEffect(() => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }

        const fetchCartCount = async () => {
            try {
                const response = await getCartService();
                // getCartService returns response.data which is { success: true, data: cart }
                // So the cart object is in response.data
                const cart = response.data;

                console.log("Navbar Cart Data:", cart);

                if (cart && Array.isArray(cart.items)) {
                    setCartCount(cart.items.length);
                } else if (cart && cart.items && typeof cart.items === 'object') {
                    // Fallback if it's an object for some reason, though schema says array
                    setCartCount(Object.keys(cart.items).length);
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

    if (loading) return null;

    const handleLogout = () => {
        logout();
        toast.info("Logged out successfully");
        setMenuOpen(false);
        setProfileMenuOpen(false);
        navigate("/login");
    };

    const handlePropertyClick = (e) => {
        e.preventDefault();
        setMenuOpen(false);
        if (user) {
            navigate("/property");
        } else {
            toast.info("Please log in to view properties");
            navigate("/login");
        }
    };

    const navItems = [
        { label: "Home", path: "/" },
        { label: "Property", path: "/property", onClick: handlePropertyClick },
        { label: "About Us", path: "/about" },
        { label: "Contact Us", path: "/contact" },
    ];

    if (isAuthenticated && (user?.role === "Administrator" || user?.role === "ADMINISTRATOR" || user?.role === "ADMIN")) {
        navItems.splice(2, 0, { label: "Add Asset", path: "/add-property" }); // Renamed to "Add Asset" per context, or keep "Add Property". User said "same as Add property". I will keep "Add Property" or "Add Asset" if I changed it before. Previous file view shows "Add Property".
        // Wait, user said "add the Management in the NavBar same as Add property". This might mean add a Management link IN ADDITION TO Add Property.
        navItems.splice(3, 0, { label: "Management", path: "/management" });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex justify-center w-full z-50 fixed top-6 px-4">
            <nav
                className={`
                    relative flex items-center justify-between
                    transition-all duration-300 ease-in-out
                    ${scrolled ? "py-2 px-6 bg-[#008080]/90 backdrop-blur-xl shadow-2xl scale-[1.02]" : "py-3 px-8 bg-[#008080] shadow-xl"}
                    rounded-full w-full max-w-5xl text-white
                    border border-white/20
                `}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-4 shrink-0">
                    <Link to="/" onClick={() => { setMenuOpen(false); setProfileMenuOpen(false); }} className="hover:opacity-90 transition-opacity flex items-center gap-2">
                        {/* Optional: Add a text logo if image is small */}
                        <img src={logo} alt="VaultLease" className="h-8 w-auto object-contain" />
                        <span className="font-bold text-lg hidden sm:block tracking-tight text-white">VaultLease</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-black/10 rounded-full p-1 mx-4">
                    {navItems.map((item) => (
                        item.onClick ? (
                            <a
                                key={item.label}
                                href={item.path}
                                onClick={item.onClick}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group
                                    ${isActive(item.path)
                                        ? "bg-white text-[#008080] shadow-sm transform scale-105"
                                        : "text-white/90 hover:text-white"
                                    }`}
                            >
                                <span className="relative z-10">{item.label}</span>
                                {!isActive(item.path) && (
                                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                                )}
                            </a>
                        ) : (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group
                                    ${isActive(item.path)
                                        ? "bg-white text-[#008080] shadow-sm transform scale-105"
                                        : "text-white/90 hover:text-white"
                                    }`}
                            >
                                <span className="relative z-10">{item.label}</span>
                                {!isActive(item.path) && (
                                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></span>
                                )}
                            </Link>
                        )
                    ))}
                </div>

                {/* Right Side Actions */}
                <div className="hidden md:flex items-center gap-4 shrink-0">
                    {/* Cart */}
                    <button
                        onClick={() => navigate("/cart")}
                        className="relative group p-2 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="w-5 h-5 text-white/90 group-hover:text-white" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm border border-[#008080]">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Profile / Auth */}
                    {isAuthenticated ? (
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-all duration-200 ${profileMenuOpen ? 'bg-white/10 ring-2 ring-white/20' : ''}`}
                            >
                                <div className="w-8 h-8 bg-white text-[#008080] rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                                    {user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-4 w-60 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                                    <div className="px-5 py-4 bg-gradient-to-r from-[#008080]/10 to-transparent">
                                        <p className="text-xs text-[#008080] uppercase font-bold tracking-wider">Account</p>
                                        <p className="text-sm font-bold text-gray-900 truncate mt-1">{user?.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2">
                                        <Link
                                            to="/profile"
                                            onClick={() => setProfileMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <User className="w-4 h-4 text-gray-500" /> My Profile
                                        </Link>
                                        <Link
                                            to="/booking_details"
                                            onClick={() => setProfileMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <Calendar className="w-4 h-4 text-gray-500" /> My Bookings
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-100 mt-1 p-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-white hover:text-white/80 transition-colors px-4 py-2"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-white text-[#008080] px-5 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Mobile Navigation Content */}
                {menuOpen && (
                    <div className="absolute top-[calc(100%+16px)] left-0 w-full bg-white rounded-3xl shadow-2xl md:hidden flex flex-col p-2 animate-in slide-in-from-top-4 duration-300 border border-gray-100 overflow-hidden">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                item.onClick ? (
                                    <a
                                        key={item.label}
                                        href={item.path}
                                        onClick={item.onClick}
                                        className={`px-4 py-3 rounded-2xl text-base font-medium transition-all ${isActive(item.path)
                                            ? "bg-[#008080]/10 text-[#008080]"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        onClick={() => setMenuOpen(false)}
                                        className={`px-4 py-3 rounded-2xl text-base font-medium transition-all ${isActive(item.path)
                                            ? "bg-[#008080]/10 text-[#008080]"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            ))}
                        </div>

                        {!isAuthenticated && (
                            <div className="flex flex-col gap-2 mt-4 p-2 bg-gray-50 rounded-2xl">
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full text-center py-3 rounded-xl text-gray-600 font-medium hover:bg-white transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setMenuOpen(false)}
                                    className="w-full text-center py-3 rounded-xl bg-[#008080] text-white font-bold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}

                        {isAuthenticated && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 px-4 mb-4">
                                    <div className="w-10 h-10 bg-[#008080] text-white rounded-full flex items-center justify-center font-bold text-lg">
                                        {user?.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-bold">{user?.fullName}</p>
                                        <p className="text-gray-500 text-xs">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 px-2">
                                    <Link
                                        to="/profile"
                                        onClick={() => setMenuOpen(false)}
                                        className="px-4 py-3 rounded-xl bg-gray-50 text-center text-sm font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/booking_details"
                                        onClick={() => setMenuOpen(false)}
                                        className="px-4 py-3 rounded-xl bg-gray-50 text-center text-sm font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Bookings
                                    </Link>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full mt-2 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </nav>
        </div>
    );
}