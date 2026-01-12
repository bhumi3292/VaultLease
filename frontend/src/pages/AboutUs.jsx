import React from "react";
import { Link } from "react-router-dom"; // Use Link from react-router-dom

// Import icons from lucide-react
import { Users, Target, Award, Shield, Heart, Globe, TrendingUp } from "lucide-react";

import bhumiSinghImage from "../assets/a.png"; // Changed to a.png for Bhumi Singh
import aboutMissionImage from "../assets/c.png"; // Changed to c.png for Mission Section


export default function AboutUs() {
    const stats = [
        { label: "Properties Listed", value: "50,000+", icon: TrendingUp },
        { label: "Happy Customers", value: "25,000+", icon: Users },
        { label: "Cities Covered", value: "100+", icon: Globe },
        { label: "Years of Experience", value: "8+", icon: Award },
    ];

    const team = [
        {
            name: "Bhumi Singh Subedi",
            role: "Developer",
            image: bhumiSinghImage,
            bio: "Former real estate executive with years of experience in property management.",
        },
    ];

    const values = [
        {
            icon: Shield,
            title: "Trust & Security",
            description: "We verify every property and landlord to ensure safe, secure transactions.",
        },
        {
            icon: Globe,
            title: "Accessibility",
            description: "Making campus spaces easy to find and reserve for students and staff.",
        },
        {
            icon: Heart,
            title: "Community",
            description: "We support campus events and research by connecting people with the right spaces.",
        },
    ];

    // Helper component for Card structure
    const CustomCard = ({ children, className = "" }) => (
        <div className={`bg-white rounded-lg shadow-md ${className}`}>
            <div className="p-6">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* Hero Section */}
            <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About VaultLease</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        VaultLease connects students and staff with university department rooms and labs. Reserve spaces for classes,
                        events, and research — fast and securely.
                    </p>
                    <Link to="/departments">
                        <button className="bg-[#008080] hover:bg-[#006666] text-white px-8 py-3 text-lg rounded-md transition-colors shadow-lg shadow-[#008080]/30 transform hover:-translate-y-1">
                            Explore Departments
                        </button>
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <CustomCard key={index} className="text-center border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                                <div className="bg-[#008080]/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#008080]/10 transition-colors">
                                    <stat.icon className="h-10 w-10 text-[#008080]" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </CustomCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                                VaultLease streamlines access to university department rooms — from labs to lecture halls — so academic
                                activities and events run smoothly.
                            </p>
                            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                                We partner with departments to publish available spaces, schedule reservations, and make room management
                                effortless for administrators and students alike.
                            </p>
                            <div className="flex items-center space-x-4 p-5 bg-[#008080]/5 rounded-xl border border-[#008080]/10">
                                <Target className="h-8 w-8 text-[#008080]" />
                                <span className="text-lg font-semibold text-[#008080]">Making flexible campus access a reality</span>
                            </div>
                        </div>
                        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2 transform hover:scale-[1.02] transition-transform duration-500">
                            {/* ⭐ Using the imported c.png here ⭐ */}
                            <img src={aboutMissionImage} alt="Our mission" className="object-cover w-full h-full" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section (re-using the structure from Home.test.jsx.jsx) */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">The core principles that guide how we manage campus spaces and serve our university community.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <CustomCard key={index} className="text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
                                <div className="bg-[#008080]/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
                                    <value.icon className="h-8 w-8 text-[#008080]" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </CustomCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                        <p className="text-gray-600 text-lg">The dedicated individuals behind VaultLease</p>
                    </div>
                    <div className="flex justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-md w-full">
                            {team.map((member, index) => (
                                <CustomCard key={index} className="text-center hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
                                    <div className="relative w-40 h-40 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#008080]/20 p-1 bg-white">
                                        {/* ⭐ Using member.image which now holds the imported a.png ⭐ */}
                                        <img src={member.image} alt={member.name} className="object-cover w-full h-full rounded-full" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                                    {/* Custom Badge styling */}
                                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-[#008080]/10 text-[#008080] mb-4">
                                        {member.role}
                                    </span>
                                    <p className="text-gray-600 italic">"{member.bio}"</p>
                                </CustomCard>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#008080] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Reserve a Department Space?</h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Book labs, lecture halls, and shared facilities across your campus with VaultLease today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/departments">
                            <button className="bg-white text-[#008080] hover:bg-gray-100 px-8 py-4 text-lg rounded-lg transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Browse Departments
                            </button>
                        </Link>
                        <Link to="/add-property">
                            <button
                                className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg rounded-lg transition-all font-bold"
                            >
                                Add Listing
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}