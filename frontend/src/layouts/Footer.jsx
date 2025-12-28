import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, Home } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#1F4E79] border-t border-blue-800 text-white w-full font-body">
            <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row justify-between gap-12">

                {/* Brand & Description */}
                <div className="md:w-1/3">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-white rounded-lg p-1.5 text-[#1F4E79]">
                            <Home size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold text-white font-heading tracking-tight">VaultLease</span>
                    </div>
                    <p className="text-blue-100 mb-6 text-sm leading-relaxed max-w-sm">
                        Securely access and manage university assets with ease. Verified listings and streamlined requests for students and staff.
                    </p>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#1F4E79] transition-all cursor-pointer">
                            <Facebook size={18} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#1F4E79] transition-all cursor-pointer">
                            <Twitter size={18} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#1F4E79] transition-all cursor-pointer">
                            <Instagram size={18} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#1F4E79] transition-all cursor-pointer">
                            <Linkedin size={18} />
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="md:w-1/6">
                    <h3 className="text-white font-bold mb-6 font-heading">Explore</h3>
                    <ul className="space-y-4 text-sm text-blue-100">
                        <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                        <li><a href="/assets" className="hover:text-white transition-colors">Assets</a></li>
                        <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                        <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                    </ul>
                </div>

                {/* Support */}
                <div className="md:w-1/6">
                    <h3 className="text-white font-bold mb-6 font-heading">Support</h3>
                    <ul className="space-y-4 text-sm text-blue-100">
                        <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                        <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="md:w-1/4">
                    <h3 className="text-white font-bold mb-6 font-heading">Contact Us</h3>
                    <div className="space-y-4 text-sm text-blue-100">
                        <p className="flex items-center gap-3">
                            <Mail className="text-blue-300 w-5 h-5" />
                            <span>support@vaultlease.edu</span>
                        </p>
                        <p className="flex items-center gap-3">
                            <Phone className="text-blue-300 w-5 h-5" />
                            <span>+1 (555) 0199-283</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-blue-800 py-8">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-blue-200">
                    <p>&copy; {new Date().getFullYear()} VaultLease System. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white">Sitemap</a>
                        <a href="#" className="hover:text-white">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
