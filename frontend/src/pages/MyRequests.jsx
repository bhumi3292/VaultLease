import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../auth/AuthProvider';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    PlayCircle,
    RotateCcw,
    Search
} from 'lucide-react';

const MyRequestsPage = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'department'

    useEffect(() => {
        if (isAuthenticated) {
            // Default to department view for admins when specifically landing here?
            // Or just default to personal and let them switch?
            // Let's set default based on role ONCE on mount
            if (user?.role === 'ADMINISTRATOR' || user?.role === 'ADMIN') {
                setViewMode('department');
            } else {
                setViewMode('personal');
            }
        }
    }, [isAuthenticated, user?.role]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRequests();
        }
    }, [isAuthenticated, user, viewMode]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            let endpoint = '/api/access/my-requests';

            if (viewMode === 'department' && (user?.role === 'ADMINISTRATOR' || user?.role === 'ADMIN')) {
                endpoint = '/api/access/department-requests';
            }

            const response = await axios.get(`http://localhost:3001${endpoint}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                setRequests(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this request as ${newStatus}?`)) return;

        try {
            const response = await axios.put(`http://localhost:3001/api/access/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.data.success) {
                toast.success(`Request marked as ${newStatus}`);
                fetchRequests(); // Refresh
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Update failed");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Returned': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
            case 'Rejected': return 'bg-red-50 text-red-400 border-red-100';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    const isAdministrator = user?.role === 'ADMINISTRATOR' || user?.role === 'ADMIN';

    // Filter logic
    const filteredRequests = mapStatusFilter(requests, filterStatus);

    function mapStatusFilter(reqs, status) {
        if (status === 'All') return reqs;
        if (status === 'Active') return reqs.filter(r => ['Approved', 'Active'].includes(r.status));
        return reqs.filter(r => r.status === status);
    }

    if (!isAuthenticated) return <div className="p-10 text-center">Please login.</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {viewMode === 'department' ? 'Department Requests' : 'My Access Requests'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {viewMode === 'department'
                                ? 'Manage incoming access requests for your assets'
                                : 'Track status of your equipment and room requests'}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        {/* Administrator View Switcher */}
                        {isAdministrator && (
                            <div className="bg-slate-200 p-1 rounded-lg flex">
                                <button
                                    onClick={() => setViewMode('department')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'department' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    Department
                                </button>
                                <button
                                    onClick={() => setViewMode('personal')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'personal' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                                >
                                    My Personal
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            {['All', 'Pending', 'Active', 'Returned'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterStatus === s ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-300">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">No requests found</h3>
                        <p className="text-gray-500">You don't have any requests in this category.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                        <th className="px-6 py-4">Asset</th>
                                        <th className="px-6 py-4">Dates</th>
                                        <th className="px-6 py-4">Requester</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredRequests.map(req => (
                                        <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mr-3">
                                                        {/* Placeholder or Image */}
                                                        <Search size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{req.asset?.name || 'Unknown Asset'}</p>
                                                        <p className="text-xs text-gray-500">{req.asset?.serialNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {new Date(req.startDate).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1.5"><RotateCcw size={14} className="text-secondary" /> {new Date(req.expectedReturnDate).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{req.requester?.fullName}</p>
                                                    <p className="text-xs text-gray-500">{req.requester?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* Actions based on Role and Status */}

                                                {viewMode === 'department' ? (
                                                    <div className="flex justify-end gap-2">
                                                        {req.status === 'Pending' && (
                                                            <>
                                                                <button onClick={() => handleStatusUpdate(req._id, 'Approved')} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200" title="Approve">
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <button onClick={() => handleStatusUpdate(req._id, 'Rejected')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Reject">
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {req.status === 'Approved' && (
                                                            <button onClick={() => handleStatusUpdate(req._id, 'Active')} className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold flex items-center gap-1">
                                                                <PlayCircle size={14} /> Start Borrow
                                                            </button>
                                                        )}
                                                        {req.status === 'Active' && (
                                                            <button onClick={() => handleStatusUpdate(req._id, 'Returned')} className="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-xs font-bold flex items-center gap-1">
                                                                <RotateCcw size={14} /> Mark Returned
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    // Requester Actions
                                                    <div className="flex justify-end">
                                                        {req.status === 'Pending' && (
                                                            <button onClick={() => toast.info('Contact department to cancel.')} className="text-red-500 hover:text-red-700 text-sm font-medium">
                                                                Cancel
                                                            </button>
                                                        )}
                                                        {req.status === 'Approved' && (
                                                            <span className="text-xs text-blue-600 font-medium">Ready for Pickup</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRequestsPage;