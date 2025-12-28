import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../layouts/Navbar.jsx";
import Footer from "../layouts/Footer.jsx";
import { Users, Target, Award, Shield, Heart, Globe, TrendingUp, CheckCircle, Home } from "lucide-react";
import aboutMissionImage from "../assets/c.png";

export default function AboutUs() {
    const stats = [
        { label: "Properties Listed", value: "50,000+", icon: TrendingUp },
        { label: "Happy Customers", value: "25,000+", icon: Users },
        { label: "Cities Covered", value: "100+", icon: Globe },
        { label: "Years of Experience", value: "8+", icon: Award },
    ];

    const values = [
        {
            icon: Shield,
            title: "Trust & Security",
            description: "We verify every property and landlord to ensure safe, secure transactions.",
        },
        {
            icon: Heart,
            title: "Customer First",
            description: "Your satisfaction is our priority. We're here to help every step of the way.",
        },
        {
            icon: CheckCircle,
            title: "Quality Assurance",
            description: "Only the best properties make it to our platform through rigorous screening.",
        },
        {
            icon: Globe,
            title: "Accessibility",
            description: "Making quality housing accessible to everyone, everywhere.",
        },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-body">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-20 bg-background overflow-hidden mt-16">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 -z-10"></div>

                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-secondary font-bold text-sm mb-6 border border-blue-100">
                        <Home size={16} /> Welcome to VaultLease
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">Redefining Asset Management</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                        We're on a mission to make accessing university resources as simple and stress-free as possible.
                        VaultLease bridges the gap between departments and students with verified assets and secure processes.
                    </p>
                    <Link to="/assets">
                        <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 text-lg rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                            Explore Assets
                        </button>
                    </Link>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary">
                                    <stat.icon size={28} />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-2 font-heading">{stat.value}</div>
                                <div className="text-gray-500 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Our Purpose</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">Mission Statement</h2>
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                At VaultLease, we believe everyone deserves a place they can call home without the fear of scams or hidden issues.
                                We're transforming the rental experience by leveraging technology to create transparency, build trust,
                                and eliminate the traditional pain points of property rental.
                            </p>
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                Our platform connects verified property owners with quality tenants, ensuring a smooth, secure, and satisfying experience for both parties.
                            </p>
                            <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                                    <Target size={24} />
                                </div>
                                <span className="text-lg font-bold text-gray-800">Making rental dreams come true</span>
                            </div>
                        </div>
                        <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
                            <img src={aboutMissionImage} alt="Our mission" className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">Our Core Values</h2>
                        <p className="text-gray-600 text-lg">The principles that guide everything we do</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="text-center p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    <value.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">Ready to Find Your New Home?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of satisfied students who found their perfect asset through VaultLease.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/property">
                            <button className="bg-white text-primary hover:bg-gray-50 px-8 py-4 text-lg rounded-xl font-bold transition-colors shadow-lg">
                                Browse Properties
                            </button>
                        </Link>
                        <Link to="/add-property">
                            <button
                                className="bg-secondary text-white hover:bg-[#e09252] px-8 py-4 text-lg rounded-xl font-bold transition-colors shadow-lg"
                            >
                                List Your Asset
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}