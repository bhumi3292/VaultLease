import React from "react";
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaEnvelope,
    FaPhone,
    FaHome,
} from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="bg-[#008080] text-white w-full">
            {/* Inner container with max width and horizontal padding */}
            <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row justify-between gap-12">
                {/* Brand & Description */}
                <div className="md:w-1/4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <FaHome className="text-white text-2xl" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">VaultLease</span>
                    </div>
                    <p className="text-white/80 mb-6 text-sm leading-relaxed">
                        University-focused room rentals and asset reservations. <br />
                        Empowering academic collaboration through efficient space management.
                    </p>
                    <div className="flex gap-4 text-lg text-white/80">
                        <FaFacebookF className="hover:text-white hover:scale-110 transition-transform cursor-pointer" />
                        <FaTwitter className="hover:text-white hover:scale-110 transition-transform cursor-pointer" />
                        <FaInstagram className="hover:text-white hover:scale-110 transition-transform cursor-pointer" />
                        <FaLinkedinIn className="hover:text-white hover:scale-110 transition-transform cursor-pointer" />
                    </div>
                </div>

                {/* Quick Links */}
                <div className="md:w-1/5">
                    <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Quick Links</h3>
                    <ul className="space-y-3 text-white/80 text-sm">
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">Home</li>
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">Departments</li>
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">About Us</li>
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">News & Events</li>
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">Contact</li>
                    </ul>
                </div>

                {/* Support */}
                <div className="md:w-1/5">
                    <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Support</h3>
                    <ul className="space-y-3 text-white/80 text-sm">
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">Help Center</li>
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">FAQs</li>
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">Terms of Service</li>
                        <li className="hover:text-white hover:translate-x-1 transition-transform cursor-pointer">Privacy Policy</li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="md:w-1/4">
                    <h3 className="text-lg font-bold mb-6 border-b border-white/20 pb-2 inline-block">Contact Us</h3>
                    <div className="text-white/80 space-y-4 text-sm">
                        <p className="flex items-center gap-3">
                            <FaEnvelope className="text-white" /> hello@vaultlease.edu
                        </p>
                        <p className="flex items-center gap-3">
                            <FaPhone className="text-white" /> +977 1-4XXXXXX
                        </p>
                        <p className="flex items-center gap-3">
                            <FaHome className="text-white" /> Dillibazar, Kathmandu
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Border */}
            <div className="border-t border-white/10 mt-4 py-6 text-center text-white/60 text-sm">
                &copy; {new Date().getFullYear()} VaultLease. All rights reserved.
            </div>
        </footer>
    );
}
