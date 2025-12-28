import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Cpu, Database, Microscope, Menu } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AssetsPage = () => {
    const navigate = useNavigate();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');

    useEffect(() => {
        fetchAssets();
    }, [selectedDept]);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            let url = 'http://localhost:3001/api/assets';
            if (selectedDept !== 'All') {
                url += `?department=${encodeURIComponent(selectedDept)}`;
            }
            // Add search param if exists (in real implementation)

            const response = await axios.get(url);
            if (response.data.success) {
                setAssets(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching assets:", error);
            // toast.error("Could not load assets."); // Suppress to avoid spam on load if backend allows public
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement client side filtering or API call
        // For now, client side simple filter
        if (searchTerm.trim() === '') {
            fetchAssets();
            return;
        }
    };

    // Filter assets based on search term
    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Asset Library</h1>
                        <p className="text-slate-500 mt-1">Browse and request access to university equipment.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-grow md:w-80">
                            <input
                                type="text"
                                placeholder="Search by name, ID, or location..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        <button className="bg-white p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Categories / Departments Tabs */}
                <div className="flex overflow-x-auto gap-2 pb-6 mb-2 no-scrollbar">
                    {['All', 'Physics', 'Computer Science', 'Chemistry', 'Media', 'Engineering'].map(dept => (
                        <button
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedDept === dept
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <Microscope size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-900">No assets found</h3>
                        <p className="text-gray-500">Try adjusting your search filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAssets.map(asset => (
                            <div key={asset._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/assets/${asset._id}`)}>
                                {/* Image Area */}
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {asset.images && asset.images.length > 0 ? (
                                        <img src={`http://localhost:3001/${asset.images[0]}`} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            {selectedDept === 'Computer Science' ? <Cpu size={40} /> : <Database size={40} />}
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-md uppercase tracking-wide ${asset.status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                                                asset.status === 'In Use' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {asset.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1 truncate">{asset.name}</h3>
                                    <p className="text-xs text-primary font-semibold mb-2 uppercase">{asset.category?.name || 'Equipment'}</p>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <span className="truncate">{asset.location}</span>
                                    </div>

                                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                        {asset.accessFee > 0 ? (
                                            <span className="text-sm font-medium text-gray-900">${asset.accessFee}<span className="text-xs text-gray-500 font-normal">/borrow</span></span>
                                        ) : (
                                            <span className="text-sm font-medium text-emerald-600">Free Access</span>
                                        )}
                                        <button className="text-sm text-primary hover:underline font-medium">View Details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetsPage;