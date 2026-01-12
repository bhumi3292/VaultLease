import React, { useState } from "react";
import { Link } from "react-router-dom"; // Using react-router-dom Link

// Import icons from lucide-react
import { Mail, Phone, MapPin, Clock, MessageCircle, Headphones, FileText, Send } from "lucide-react";

export default function ContactPage() {
    const [formStatus, setFormStatus] = useState('idle');

    const contactMethods = [
        {
            icon: Mail,
            title: "Email Us",
            description: "Send us an email and we'll respond within 24 hours",
            contact: "hello@vaultlease.edu",
            action: "Send Email",
            type: "email",
        },
        {
            icon: Phone,
            title: "Call Us",
            description: "Speak directly with our support team",
            contact: "+977-1-4XXXXXX",
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
        {
            icon: FileText,
            title: "General Inquiry",
            description: "Questions about our services or platform",
        },
        {
            icon: Headphones,
            title: "Technical Support",
            description: "Help with website issues or account problems",
        },
        {
            icon: MapPin,
            title: "Property Listing",
            description: "Questions about listing your property",
        },
        {
            icon: MessageCircle,
            title: "Rental Support",
            description: "Help with finding or renting a property",
        },
    ];

    // Helper component for Card structure
    const CustomCard = ({ children, className = "" }) => (
        <div className={`bg-white rounded-xl shadow-md ${className} overflow-hidden`}>
            <div className="p-8">
                {children}
            </div>
        </div>
    );

    // Helper for Input styling
    const CustomInput = ({ placeholder, type = "text", ...props }) => (
        <input
            type={type}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:border-[#008080] transition-all bg-gray-50 focus:bg-white"
            {...props}
        />
    );

    // Helper for Textarea styling
    const CustomTextarea = ({ placeholder, rows = 3, ...props }) => (
        <textarea
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:border-[#008080] transition-all bg-gray-50 focus:bg-white resize-none"
            {...props}
        ></textarea>
    );

    const handleContactAction = (type, contactInfo) => {
        if (type === "email") {
            const encodedEmail = encodeURIComponent(contactInfo);
            window.open(`https://mail.google.com/mail/u/0/#inbox?compose=new&to=${encodedEmail}`, '_blank');
        } else if (type === "phone") {
            const cleanedNumber = contactInfo.replace(/\D/g, '');
            window.open(`tel:${cleanedNumber}`, '_self');
        } else if (type === "chat") {
            alert("Live chat feature coming soon!");
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setFormStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setFormStatus('success');
            alert("Message sent! We'll get back to you shortly.");
            setFormStatus('idle');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

            {/* Hero Section */}
            <section className="pt-12 pb-20 bg-[#008080] text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Contact Us</h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto font-light">
                        Have questions? We're here to help. Reach out to our friendly support team for any assistance.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16 -mt-16 container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {contactMethods.map((method, index) => (
                        <CustomCard key={index} className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                            <div className="bg-[#008080]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <method.icon className="h-8 w-8 text-[#008080]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                            <p className="text-gray-600 mb-6 text-sm">{method.description}</p>
                            <p className="text-lg font-semibold text-[#008080] mb-6">{method.contact}</p>
                            <button
                                className="w-full bg-white border-2 border-[#008080] text-[#008080] hover:bg-[#008080] hover:text-white px-6 py-2.5 rounded-lg transition-all font-semibold"
                                onClick={() => handleContactAction(method.type, method.contact)}
                            >
                                {method.action}
                            </button>
                        </CustomCard>
                    ))}
                </div>
            </section>

            <section className="py-12 container mx-auto px-4 mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <CustomCard className="border border-gray-100 h-full">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Send className="w-6 h-6 text-[#008080]" /> Send us a Message
                            </h2>
                            <p className="text-gray-500">Fill out the form below and our team will get back to you.</p>
                        </div>
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                    <CustomInput id="firstName" placeholder="John" />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                    <CustomInput id="lastName" placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <CustomInput id="email" type="email" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Optional)</label>
                                <CustomInput id="phone" type="tel" placeholder="(555) 123-4567" />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                <div className="relative">
                                    <select
                                        id="subject"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]/50 focus:border-[#008080] appearance-none bg-gray-50 focus:bg-white transition-all"
                                    >
                                        <option>General Inquiry</option>
                                        <option>Technical Support</option>
                                        <option>Property Listing</option>
                                        <option>Rental Support</option>
                                        <option>Partnership</option>
                                        <option>Other</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                <CustomTextarea id="message" placeholder="Tell us how we can help you..." rows={5} />
                            </div>
                            <button
                                type="submit"
                                disabled={formStatus === 'submitting'}
                                className="w-full bg-[#008080] hover:bg-[#006666] text-white py-4 rounded-lg transition-all font-bold text-lg shadow-lg shadow-[#008080]/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </CustomCard>

                    {/* Support Topics & Office Info */}
                    <div className="space-y-8 flex flex-col justify-between">
                        {/* Support Topics */}
                        <CustomCard className="border border-gray-100 flex-grow">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help?</h2>
                                <p className="text-gray-500">Choose a category to find quick answers.</p>
                            </div>
                            <div className="space-y-3">
                                {supportTopics.map((topic, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start space-x-4 p-4 rounded-xl hover:bg-[#008080]/5 cursor-pointer transition-all border border-transparent hover:border-[#008080]/20 group"
                                    >
                                        <div className="bg-[#008080]/10 p-2.5 rounded-lg group-hover:bg-[#008080] group-hover:text-white transition-colors text-[#008080]">
                                            <topic.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-[#008080] transition-colors">{topic.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CustomCard>

                        {/* Office Information */}
                        <CustomCard className="border border-gray-100 bg-[#008080]/5">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Office Information</h2>
                                <p className="text-gray-500">Visit us or contact our support.</p>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-white p-2.5 rounded-lg shadow-sm text-[#008080]">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Address</h4>
                                        <p className="text-gray-600 mt-1 leading-relaxed text-sm">
                                            Dillibazar, Kathmandu<br />
                                            Bagmati Province, Nepal<br />
                                            Post Box: 44600
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="bg-white p-2.5 rounded-lg shadow-sm text-[#008080]">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Business Hours</h4>
                                        <p className="text-gray-600 mt-1 leading-relaxed text-sm">
                                            Sunday - Friday: 9:00 AM - 6:00 PM (NST)<br />
                                            Saturday: Closed
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="bg-white p-2.5 rounded-lg shadow-sm text-[#008080]">
                                        <Headphones className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Support Hours</h4>
                                        <p className="text-gray-600 mt-1 leading-relaxed text-sm">
                                            24/7 Live Chat Support<br />
                                            Phone: Sun - Fri, 9am - 6pm
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CustomCard>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-gray-50 border-t border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-[#008080] font-bold tracking-wider uppercase text-sm mb-2 block">FAQ</span>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-600 text-lg">Quick answers to common questions about VaultLease</p>
                    </div>
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            {
                                question: "How do I list my department room?",
                                answer:
                                    "Click 'List Your Room' in the header, fill out room details, upload photos, and submit. Our team verifies listings within 24 hours.",
                            },
                            {
                                question: "Is there a fee to use VaultLease?",
                                answer:
                                    "Browsing is free. Departments or managers may incur a small administrative fee for listings, depending on institutional policies.",
                            },
                            {
                                question: "How are properties verified?",
                                answer:
                                    "We verify all listings through document checks and landlord background checks to ensure authenticity and quality.",
                            },
                            {
                                question: "Can I schedule property viewings?",
                                answer:
                                    "Yes! You can request viewings directly through property listings and coordinate times with landlords.",
                            },
                        ].map((faq, index) => (
                            <CustomCard key={index} className="border border-gray-100 hover:shadow-lg transition-shadow bg-white">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-2">
                                    <span className="text-[#008080] mt-1 shrink-0"><MessageCircle size={18} /></span> {faq.question}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed pl-7">{faq.answer}</p>
                            </CustomCard>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}