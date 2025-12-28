import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Shield, BookOpen, Clock, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const HomePage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ activeAssets: 120, totalUsers: 450, requestsToday: 15 });

    // Mock stats for now - usually fetched from an API
    useEffect(() => {
        // fetchStats();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate('/assets');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Hero Section */}
            <section className="relative bg-navy-900 text-white overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-95"></div>
                    {/* Abstract tech background pattern could go here */}
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
                            Secure <span className="text-cyan-400">Institutional Asset</span> Access
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            VaultLease provides verified access to university resources, laboratories, and equipment with secure, automated management.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-xl mx-auto mb-12"
                    >
                        <form onSubmit={handleSearch} className="relative group">
                            <input
                                type="text"
                                placeholder="Search for equipment, labs, or resources..."
                                className="w-full py-4 px-6 rounded-full text-slate-900 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 shadow-2xl transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-full transition-colors"
                            >
                                <Search size={24} />
                            </button>
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex justify-center gap-4"
                    >
                        <Link to="/assets" className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-transform transform hover:-translate-y-1 shadow-lg flex items-center gap-2">
                            Browse Assets <ArrowRight size={20} />
                        </Link>
                        <Link to="/signup" className="px-8 py-3 bg-transparent border-2 border-slate-600 hover:border-cyan-400 text-slate-300 hover:text-white font-bold rounded-lg transition-colors">
                            Register Access
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Stats / Info Section */}
            <section className="py-16 bg-white shadow-sm -mt-8 relative z-20 container mx-auto rounded-xl max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center border border-slate-100">
                <div className="p-6">
                    <div className="mx-auto w-12 h-12 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center mb-4">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Verified Security</h3>
                    <p className="text-slate-500">Only authorized personnel and students with valid department IDs can request access.</p>
                </div>
                <div className="p-6 border-l border-r border-slate-50">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mb-4">
                        <Clock size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Real-time Availability</h3>
                    <p className="text-slate-500">Check live status of labs and equipment. Book instantly for your research slots.</p>
                </div>
                <div className="p-6">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-4">
                        <Activity size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Automated Tracking</h3>
                    <p className="text-slate-500">Access logs, return reminders, and condition monitoring are fully automated.</p>
                </div>
            </section>

            {/* Featured Categories (Simulated) */}
            <section className="py-24 container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Available Departments</h2>
                        <div className="h-1 w-20 bg-cyan-500 rounded"></div>
                    </div>
                    <Link to="/assets" className="text-cyan-600 font-semibold hover:underline">View All &rarr;</Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['Physics Laboratory', 'Computer Science Center', 'Media Production', 'Chemical Engineering'].map((dept, i) => (
                        <div key={i} className="group relative overflow-hidden rounded-xl bg-white shadow hover:shadow-xl transition-all border border-slate-200 cursor-pointer" onClick={() => navigate(`/assets?department=${dept}`)}>
                            <div className="h-40 bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors">
                                <BookOpen size={48} />
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-600 transition-colors">{dept}</h3>
                                <p className="text-sm text-slate-500">Request Access</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-slate-900 py-20 text-center text-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-6">Ready to access institutional resources?</h2>
                    <p className="text-slate-400 mb-8 max-w-2xl mx-auto">Create your qualified account today using your university credentials to get started.</p>
                    <Link to="/signup" className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg">
                        Get Started
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;