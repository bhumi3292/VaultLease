import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../auth/AuthProvider';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, Info, ShieldCheck, Building2 } from 'lucide-react';

const AssetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);

    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestData, setRequestData] = useState({
        startDate: '',
        expectedReturnDate: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAssetDetails();
    }, [id]);

    const fetchAssetDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3001/api/assets/${id}`);
            if (response.data.success) {
                setAsset(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching usage details:", error);
            toast.error("Asset details not found.");
            navigate('/assets');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestChange = (e) => {
        setRequestData({ ...requestData, [e.target.name]: e.target.value });
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.info("Please login to request assets.");
            navigate('/login');
            return;
        }

        if (user.role !== 'REQUESTER') {
            toast.error("Only Requesters can submit access requests.");
            return;
        }

        if (!requestData.startDate || !requestData.expectedReturnDate) {
            toast.error("Please select both start and return dates.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                assetId: id,
                startDate: requestData.startDate,
                expectedReturnDate: requestData.expectedReturnDate,
                notes: requestData.notes
            };

            const response = await axios.post('http://localhost:3001/api/access/request', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                toast.success("Access request submitted successfully!");
                navigate('/my-requests');
            }
        } catch (error) {
            console.error("Request error:", error);
            toast.error(error.response?.data?.message || "Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading asset details...</div>;
    if (!asset) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">

                {/* Left Side: Images & Info */}
                <div className="md:w-1/2 p-0 bg-gray-100 relative">
                    {asset.images && asset.images.length > 0 ? (
                        <img src={`http://localhost:3001/${asset.images[0]}`} alt={asset.name} className="w-full h-96 md:h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-96 md:h-full bg-slate-200 text-slate-400">
                            <Info size={64} />
                            <span className="ml-2 text-xl font-bold">No Image</span>
                        </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-gray-800 shadow-sm border border-gray-200">
                        {asset.serialNumber}
                    </div>
                </div>

                {/* Right Side: Details & Request Form */}
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
                    <div className="mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-primary font-bold uppercase tracking-wider mb-1">{asset.category?.name || 'Equipment'}</p>
                                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{asset.name}</h1>
                            </div>
                            <span className={`px-3 py-1 text-sm font-bold rounded-full border ${asset.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                {asset.status}
                            </span>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center text-gray-600">
                                <MapPin size={18} className="mr-2 text-primary" />
                                <span>{asset.location}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Building2 size={18} className="mr-2 text-primary" />
                                {/* Building2 component imported? No, let's use ShieldCheck as placeholder or check imports */}
                                <span>Department: {asset.department}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <ShieldCheck size={18} className="mr-2 text-primary" />
                                <span>Condition: {asset.condition || 'Good'}</span>
                            </div>
                        </div>

                        <p className="mt-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                            {asset.description || "No description provided."}
                        </p>
                    </div>

                    <div className="mt-auto bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Calendar size={20} className="mr-2 text-secondary" /> Request Access
                        </h3>

                        {asset.availableQuantity < 1 ? (
                            <div className="bg-amber-100 text-amber-800 p-4 rounded-lg text-center font-medium border border-amber-200">
                                This asset is currently out of stock ({asset.availableQuantity} available).
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitRequest} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                            value={requestData.startDate}
                                            onChange={handleRequestChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Return Date</label>
                                        <input
                                            type="date"
                                            name="expectedReturnDate"
                                            required
                                            min={requestData.startDate || new Date().toISOString().split('T')[0]}
                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                            value={requestData.expectedReturnDate}
                                            onChange={handleRequestChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Purpose / Notes</label>
                                    <textarea
                                        name="notes"
                                        rows="2"
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                        placeholder="e.g. Required for Physics Lab 101"
                                        value={requestData.notes}
                                        onChange={handleRequestChange}
                                    ></textarea>
                                </div>

                                {/* Fees Info */}
                                <div className="flex justify-between items-center text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                                    <span>Access Fee:</span>
                                    <span className="font-bold text-gray-900">{asset.accessFee > 0 ? `$${asset.accessFee}` : 'Free'}</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white ${submitting ? 'bg-primary/70' : 'bg-primary hover:bg-primary-hover'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all`}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetDetails;