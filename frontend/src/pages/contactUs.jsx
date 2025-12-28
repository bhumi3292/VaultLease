import React from "react";
import Navbar from "../layouts/Navbar.jsx";
import Footer from "../layouts/Footer.jsx";
import { Mail, Phone, MapPin, Clock, MessageCircle, Headphones, FileText, Send } from "lucide-react";

export default function ContactPage() {
    const contactMethods = [
        {
            icon: Mail,
            title: "Email Us",
            description: "Send us an email and we'll respond within 24 hours",
            contact: "support@vaultlease.edu",
            action: "Send Email",
            type: "email",
        },
        {
            icon: Phone,
            title: "Call Us",
            description: "Speak directly with our support team",
            contact: "+977-9812345678",
            action: "Call Now",
            type: "phone",
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            description: "Chat with us in real-time for immediate assistance",
            contact: "Available 24/7",
            action: "Start Chat",
            type: "chat",
        },
    ];

    const supportTopics = [
        { title: "General Inquiry", description: "Questions about our services or platform", icon: FileText },
        { title: "Technical Support", description: "Help with website issues or account problems", icon: Headphones },
        { title: "Asset Listing", description: "Questions about listing your asset", icon: MapPin },
        { title: "Rental Support", description: "Help with finding or renting a property", icon: MessageCircle },
    ];

    const handleFormSubmit = (e) => {
        e.preventDefault();
        alert("Thanks for reaching out! We will get back to you shortly.");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-body">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 bg-primary/5 mt-16 overflow-hidden">
                <div className="container mx-auto px-4 text-center z-10 relative">
                    <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">We'd love to hear from you</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">Get in Touch</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions about VaultLease? We're here to help you find your way home.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16 -mt-10 mb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {contactMethods.map((method, index) => (
                            <div key={index} className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:-translate-y-1 transition-transform">
                                <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
                                    <method.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">{method.title}</h3>
                                <p className="text-gray-500 mb-4 text-sm">{method.description}</p>
                                <p className="text-lg font-bold text-primary mb-6">{method.contact}</p>
                                <button className="text-secondary hover:text-primary font-bold text-sm uppercase tracking-wide transition-colors">
                                    {method.action} &rarr;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pb-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Send a Message</h2>
                                <p className="text-gray-500">Fill out the form below and we'll get back to you ASAP.</p>
                            </div>
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                        <input type="text" placeholder="John" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-gray-50 focus:bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                        <input type="text" placeholder="Doe" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-gray-50 focus:bg-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-gray-50 focus:bg-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-gray-50 focus:bg-white">
                                        <option>General Inquiry</option>
                                        <option>Technical Support</option>
                                        <option>Asset Listing</option>
                                        <option>Rental Support</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                    <textarea rows="5" placeholder="How can we help you?" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-gray-50 focus:bg-white resize-none"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]">
                                    <Send size={20} /> Send Message
                                </button>
                                <p className="text-xs text-center text-gray-400 mt-4">
                                    By sending this message, you agree to our <span className="underline cursor-pointer hover:text-primary">Privacy Policy</span>. We will never share your data.
                                </p>
                            </form>
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 font-heading">How can we help?</h2>
                                <div className="space-y-4">
                                    {supportTopics.map((topic, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                            <div className="bg-primary/10 p-2.5 rounded-lg text-primary mt-1">
                                                <topic.icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{topic.title}</h4>
                                                <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-secondary text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                                <h2 className="text-2xl font-bold mb-6 font-heading relative z-10">Visit Our Office</h2>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="mt-1 flex-shrink-0" />
                                        <p className="leading-relaxed opacity-90">
                                            Dillibazar, Kathmandu<br />
                                            Bagmati Province, Nepal<br />
                                            Post Box: 44600
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Clock className="mt-1 flex-shrink-0" />
                                        <p className="leading-relaxed opacity-90">
                                            Sun - Fri: 9:00 AM - 6:00 PM<br />
                                            Saturday: Closed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}