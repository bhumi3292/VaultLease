import React, { useEffect, useState, useContext } from "react";
import Navbar from "../layouts/navbar.jsx";
import Footer from "../layouts/footer.jsx";
import Newsletter from "./Newsletter.jsx";
import { Link, useNavigate } from "react-router-dom";
import { fetchPropertiesService } from "../services/addPropertyService.jsx";
import PropertyCard from "../properties/PropertyCard.jsx";
import { AuthContext } from "../auth/AuthProvider";
import { toast } from "react-toastify";

// Icons (using Lucide or simplistic SVGs if Lucide isn't installed, but I'll stick to SVGs for safety)
const HeroIcon = () => (
    <svg className="w-24 h-24 text-white opacity-20 absolute top-10 right-10 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
    </svg>
);

export default function Home() {
    const [properties, setProperties] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const loadProperties = async () => {
            try {
                const data = await fetchPropertiesService();
                setProperties(data.slice(0, 3)); // Take first 3 for featured
            } catch (error) {
                console.error("Error loading assets:", error);
            }
        };
        loadProperties();
    }, []);

    const handleSeeAll = () => {
        if (user) {
            navigate("/property");
        } else {
            toast.info("Please log in to browse full catalog");
            navigate("/login");
        }
    };

    return (
        <div className="w-full flex flex-col min-h-screen bg-[#F4F8F8]">
            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            {/* HERO SECTION */}
            <section className="relative pt-[120px] pb-24 bg-gradient-to-br from-[#008080] to-[#005F5F] text-white overflow-hidden">
                <HeroIcon />
                <div className="container mx-auto px-6 relative z-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between">
                    <div className="md:w-1/2 mb-10 md:mb-0">
                        <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 text-[#F4F8F8] tracking-wide">
                            OFFICIAL UNIVERSITY PORTAL
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                            University Asset <br />
                            <span className="text-[#C9A227]">Leasing System</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-50 mb-8 max-w-lg leading-relaxed">
                            A centralized platform for students and staff to borrow, track, and manage university resources efficiently and securely.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link
                                to={user ? "/property" : "/login"}
                                className="bg-[#C9A227] hover:bg-[#b08d21] text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:-translate-y-1"
                            >
                                Browse Assets
                            </Link>
                            {!user && (
                                <Link
                                    to="/login"
                                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#008080] font-bold py-3 px-8 rounded-lg transition transform hover:-translate-y-1"
                                >
                                    Student Login
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Abstract Illustration / Graphic */}
                    <div className="md:w-1/2 flex justify-center relative">
                        <div className="w-72 h-72 md:w-96 md:h-96 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-2xl relative translate-x-4">
                            <div className="text-center">
                                <div className="text-5xl font-bold mb-2">1,200+</div>
                                <div className="text-white/80 uppercase text-sm tracking-wider">Resources</div>
                            </div>
                            {/* Floating Elements */}
                            <div className="absolute -top-4 -left-4 bg-white text-[#008080] p-4 rounded-lg shadow-lg font-bold text-sm">
                                📚 Library
                            </div>
                            <div className="absolute bottom-10 -right-8 bg-white text-[#008080] p-4 rounded-lg shadow-lg font-bold text-sm">
                                🔬 Lab Equipment
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* KEY FEATURES SECTION */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#1F2933] mb-4">Why VaultLease?</h2>
                        <div className="w-20 h-1 bg-[#008080] mx-auto rounded"></div>
                        <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto">
                            Designed to streamline the borrowing process for the entire university campus.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="p-8 bg-[#F4F8F8] rounded-xl border border-gray-100 hover:shadow-lg transition">
                            <div className="w-14 h-14 bg-[#008080] rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 17h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#1F2933] mb-3">Easy Tracking</h3>
                            <p className="text-[#6B7280]">
                                Real-time availability status for all university assets. Know exactly what's in stock.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 bg-[#F4F8F8] rounded-xl border border-gray-100 hover:shadow-lg transition">
                            <div className="w-14 h-14 bg-[#008080] rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#1F2933] mb-3">Automated Due Dates</h3>
                            <p className="text-[#6B7280]">
                                Smart system that automatically calculates due dates and notifies students of returns.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 bg-[#F4F8F8] rounded-xl border border-gray-100 hover:shadow-lg transition">
                            <div className="w-14 h-14 bg-[#008080] rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#1F2933] mb-3">Secure Approval</h3>
                            <p className="text-[#6B7280]">
                                Administrator verification ensures only authorized personnel and students access high-value items.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED ASSETS (Dynamic) */}
            <div className="container mx-auto px-6 py-20">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-[#1F2933]">Recent Additions</h2>
                        <p className="text-[#6B7280] mt-2">Latest resources available for checkout</p>
                    </div>
                    <button
                        onClick={handleSeeAll}
                        className="text-[#008080] font-semibold hover:text-[#005F5F] flex items-center gap-1 transition-colors"
                    >
                        View Catalog <span>&rarr;</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {properties.length > 0 ? (
                        properties.map((property) => (
                            <PropertyCard
                                key={property._id}
                                property={property}
                                currentUserId={user?._id}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No assets currently listed.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* TRUST / FOOTER PREVIEW SECTION */}
            <section className="bg-[#002B5B] py-20 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-8">Trusted by University Departments</h2>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
                        <span className="text-xl font-semibold">Computer Science</span>
                        <span className="text-xl font-semibold">Physics Lab</span>
                        <span className="text-xl font-semibold">Media Center</span>
                        <span className="text-xl font-semibold">Library Ops</span>
                    </div>
                </div>
            </section>

            <Newsletter />
        </div>
    );
}