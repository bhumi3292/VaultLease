import React, { useState, useContext, useEffect } from 'react';
import {
    LayoutDashboard, Building, Calendar, Users, CreditCard, MessageSquare,
    Wrench, FileText, Settings, Bell, Search, PlusCircle, Filter,
    MoreVertical, CheckCircle, XCircle, AlertTriangle, ChevronLeft,
    LogOut, Menu, Trash2, Edit, RefreshCw, Send, Layers, CalendarCheck
} from 'lucide-react';
import { AuthContext } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllPropertiesApi, deletePropertyApi } from '../api/propertyApi';
import {
    getAllUsersApi, deleteUserApi, updateUserApi, createUserApi,
    getAllPaymentsApi, updatePaymentStatusApi, getAuditLogsApi,
    getDashboardStatsApi
} from '../api/adminApi';
import { getAllBookingsApi, updateBookingStatusApi } from '../api/bookingApi';

import { createOrGetChat, getMyChats } from '../api/chatApi';
import { createCategoryApi, getCategoriesApi, updateCategoryApi, deleteCategoryApi } from '../api/categoryApi';
import { logoutUserApi } from '../api/authApi';
import ChatView from '../components/ChatView';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Sub-Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 
        ${active ? 'bg-[#006666] text-white' : 'text-white/80 hover:bg-[#006666] hover:text-white'}
        ${collapsed ? 'justify-center px-2' : ''}`}
        title={collapsed ? label : ''}
    >
        <Icon size={20} />
        {!collapsed && <span className="font-medium text-sm">{label}</span>}
    </button>
);

const MetricCard = ({ title, value, icon: Icon, trend, trendUp, colorClass = "bg-white" }) => (
    <div className={`${colorClass} p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between`}>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
            {trend && (
                <p className={`text-xs mt-2 flex items-center ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                    {trendUp ? '↑' : '↓'} {trend}
                </p>
            )}
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-[#008080]">
            <Icon size={24} />
        </div>
    </div>
);

// --- User Form Modal ---
const UserModal = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        role: 'Student',
        universityId: '',
        password: '',
        department: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                role: user.role || 'Student',
                universityId: user.universityId || '',
                password: '', // Don't show password
                department: user.department || ''
            });
        } else {
            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                role: 'Student',
                universityId: '',
                password: '',
                department: ''
            });
        }
    }, [user, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">{user ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg outline-none">
                                <option value="Student">Student</option>
                                <option value="Administrator">Administrator</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" required value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">University ID</label>
                            <input type="text" required value={formData.universityId} onChange={e => setFormData({ ...formData, universityId: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg outline-none" />
                        </div>
                    </div>

                    {formData.role === 'Administrator' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <input type="text" required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg outline-none" />
                        </div>
                    )}

                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg outline-none" />
                        </div>
                    )}

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mt-2">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] mt-2 font-medium">{user ? 'Update User' : 'Create User'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Category Modal ---
const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (category) setName(category.department_name || category.category_name || '');
        else setName('');
    }, [category, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ name: name }); // Backend expects 'name'
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{category ? 'Edit Category' : 'Add Category'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] outline-none" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" className="flex-1 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] font-medium">{category ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Views ---

const DashboardView = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalAssets: 0, totalPayments: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const data = [
        { name: 'Jan', uv: 4000 },
        { name: 'Feb', uv: 3000 },
        { name: 'Mar', uv: 2000 },
        { name: 'Apr', uv: 2780 },
        { name: 'May', uv: 1890 },
        { name: 'Jun', uv: 2390 },
        { name: 'Jul', uv: 3490 },
    ];

    useEffect(() => {
        getDashboardStatsApi().then(res => setStats(res.data.stats))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading Stats...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Assets" value={stats.totalAssets} icon={Building} trend="Updated now" trendUp={true} />
                <MetricCard title="Total Users" value={stats.totalUsers} icon={Users} trend="Active accounts" trendUp={true} />
                <MetricCard title="Total Transactions" value={stats.totalPayments} icon={FileText} trend="Lifetime" trendUp={true} />
                <MetricCard title="Total Revenue" value={`Rs. ${stats.totalRevenue}`} icon={CreditCard} trend="Completed" trendUp={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Analytics Overview</h3>
                    <div className="h-64 w-full" style={{ minHeight: "250px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="uv" fill="#008080" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">System Alerts</h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded text-blue-700 text-sm">System running smoothly</div>
                        <div className="p-3 bg-green-50 rounded text-green-700 text-sm">Database connected</div>
                        <div className="p-3 bg-gray-50 rounded text-gray-700 text-sm">All services active</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AssetsView = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAssets = () => {
        setLoading(true);
        getAllPropertiesApi().then(res => setAssets(res.data?.data || [])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchAssets(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Delete this asset? This action cannot be undone.")) {
            try {
                await deletePropertyApi(id);
                toast.success("Asset deleted successfully");
                fetchAssets();
            } catch (e) {
                console.error(e);
                toast.error(e.response?.data?.message || "Deletion failed");
            }
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between">
                <h3 className="text-lg font-bold text-gray-800">University Assets</h3>
                <button onClick={() => navigate('/add-property')} className="bg-[#008080] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <PlusCircle size={16} /> Add Asset
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Asset Name</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Quantity</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan="5" className="p-6 text-center">Loading...</td></tr> : assets.map(a => (
                            <tr key={a._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{a.title || a.roomName}</td>
                                <td className="px-6 py-4">{a.location || 'N/A'}</td>
                                <td className="px-6 py-4">{a.bedrooms || a.capacity}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(a.status || 'Available') === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.status || 'Available'}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => navigate(`/update-property/${a._id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded mr-1"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(a._id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CategoriesView = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchCategories = () => {
        setLoading(true);
        // Correctly handling response structure: res.data.data
        getCategoriesApi().then(res => setCategories(res.data?.data || [])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Delete this category?")) {
            try {
                await deleteCategoryApi(id);
                toast.success("Category deleted");
                fetchCategories();
            } catch (e) { toast.error("Delete failed"); }
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingCategory) {
                await updateCategoryApi(editingCategory._id, data);
                toast.success("Category updated");
            } else {
                await createCategoryApi(data);
                toast.success("Category created");
            }
            setIsModalOpen(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (e) {
            toast.error(e.response?.data?.message || "Operation failed");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Category Management</h3>
                <button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="bg-[#008080] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <PlusCircle size={16} /> Add Category
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Category Name</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan="3" className="p-4 text-center">Loading...</td></tr> : categories.map(c => (
                            <tr key={c._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 capitalize">{c.department_name || c.category_name}</td>
                                <td className="px-6 py-4 text-gray-500">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => { setEditingCategory(c); setIsModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded mr-1"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} category={editingCategory} onSave={handleSave} />
        </div>
    );
};

const UsersView = ({ onStartChat }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = () => {
        setLoading(true);
        getAllUsersApi().then(res => setUsers(res.data?.users || [])).catch(() => toast.error('Failed to fetch users')).finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUserApi(id);
                toast.success('User deleted');
                fetchUsers();
            } catch (err) { toast.error('Delete failed'); }
        }
    };

    const handleSaveUser = async (formData) => {
        try {
            if (editingUser) {
                await updateUserApi(editingUser._id, formData);
                toast.success('User updated successfully');
            } else {
                await createUserApi(formData);
                toast.success('User created successfully');
            }
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">User Management</h3>
                <div className="flex gap-2">
                    <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="bg-[#008080] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-[#006666]">
                        <PlusCircle size={16} /> Add User
                    </button>
                    <button onClick={fetchUsers} className="text-[#008080] hover:bg-gray-50 p-2 rounded"><RefreshCw size={18} /></button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr> : users.map(u => (
                            <tr key={u._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{u.fullName}</td>
                                <td className="px-6 py-4">{u.email}</td>
                                <td className="px-6 py-4">{u.role}</td>
                                <td className="px-6 py-4 text-right flex justify-end">
                                    <button onClick={() => onStartChat(u._id)} title="Message User" className="text-green-600 hover:bg-green-50 p-2 rounded mr-1"><Send size={16} /></button>
                                    <button onClick={() => { setEditingUser(u); setIsModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded mr-1"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={editingUser} onSave={handleSaveUser} />
        </div>
    );
};

const PaymentsView = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = () => {
        setLoading(true);
        getAllPaymentsApi().then(res => setPayments(res.data?.payments || [])).finally(() => setLoading(false));
    };

    useEffect(() => { fetchPayments(); }, []);

    const handleUpdateStatus = async (id, status) => {
        if (window.confirm(`Mark this payment as ${status}?`)) {
            try {
                await updatePaymentStatusApi(id, status);
                toast.success(`Payment marked as ${status}`);
                fetchPayments();
            } catch (err) { toast.error('Update failed'); }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Transaction History</h3>
                <button onClick={fetchPayments} className="text-[#008080] hover:bg-gray-50 p-2 rounded"><RefreshCw size={18} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Property</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr> : payments.map(p => (
                            <tr key={p._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{p.user?.fullName || 'Unknown'}</td>
                                <td className="px-6 py-4">{p.property?.title || 'Unknown'}</td>
                                <td className="px-6 py-4">Rs. {p.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'refunded' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {p.status !== 'refunded' && (
                                        <button onClick={() => handleUpdateStatus(p._id, 'refunded')} className="text-purple-600 hover:text-purple-800 text-xs font-semibold mr-2">Refund</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BookingsView = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = () => {
        setLoading(true);
        getAllBookingsApi()
            .then(res => setBookings(res.data?.data || []))
            .catch(err => toast.error("Failed to load bookings"))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleMarkReturned = async (id) => {
        if (window.confirm("Confirm return of this asset? This will increase available quantity.")) {
            try {
                await updateBookingStatusApi(id, 'returned');
                toast.success("Asset marked as returned");
                fetchBookings();
            } catch (error) {
                toast.error("Failed to update status");
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Lease/Booking Requests</h3>
                <button onClick={fetchBookings} className="text-[#008080] hover:bg-gray-50 p-2 rounded"><RefreshCw size={18} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Asset</th>
                            <th className="px-6 py-4">Tenant/Student</th>
                            <th className="px-6 py-4">Collected Date</th>
                            <th className="px-6 py-4">Returned Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr> : bookings.length === 0 ? <tr><td colSpan="6" className="p-4 text-center">No bookings found</td></tr> : bookings.map(b => (
                            <tr key={b._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{b.property?.title || b.property?.roomName || 'Unknown Asset'}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{b.tenant?.fullName || 'Unknown'}</div>
                                    <div className="text-xs text-gray-400">{b.tenant?.email}</div>
                                </td>
                                <td className="px-6 py-4">{new Date(b.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    {b.returnedAt ? (
                                        <div className="text-green-600 font-medium text-xs">
                                            {new Date(b.returnedAt).toLocaleDateString()}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">Pending Return</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' : b.status === 'returned' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {b.status === 'confirmed' && (
                                        <button onClick={() => handleMarkReturned(b._id)} className="bg-[#008080] text-white px-3 py-1 rounded text-xs hover:bg-[#006666]">
                                            Mark Returned
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AuditLogsView = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAuditLogsApi().then(res => setLogs(res.data?.logs || [])).finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">System Audit Logs</h3>
            </div>
            <div className="overflow-x-auto h-[600px]">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 uppercase text-xs sticky top-0">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr> : logs.map((log, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium">{log.user?.fullName || 'System/Guest'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.action === 'LOGIN' ? 'bg-green-100 text-green-800' : log.action === 'LOGOUT' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs truncate max-w-xs" title={log.details}>{log.details}</td>
                                <td className="px-6 py-4 text-xs font-mono text-gray-500">{log.ipAddress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MessagesView = ({ selectedChatId, onSelectChat, currentUserId }) => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyChats().then(data => setChats(data || [])).finally(() => setLoading(false));
    }, [selectedChatId]); // Refetch when chat might have changed

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex h-[600px] overflow-hidden">
            <div className="w-1/3 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">Inbox</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? <p className="p-4 text-center text-sm text-gray-500">Loading...</p> : chats.length === 0 ? (
                        <p className="p-4 text-center text-sm text-gray-500">No conversations yet.</p>
                    ) : (
                        chats.map(chat => {
                            const other = chat.participants.find(p => p._id !== currentUserId);
                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => onSelectChat(chat._id)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChatId === chat._id ? 'bg-[#F0FDFD] border-l-4 border-l-[#008080]' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                                            {other?.fullName?.charAt(0) || '?'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-semibold text-gray-800 text-sm truncate">{other?.fullName || 'User'}</h4>
                                            <p className="text-xs text-gray-500 truncate">{chat.lastMessage || 'Start conversation...'}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="flex-1 flex flex-col bg-white">
                {selectedChatId ? (
                    <div className="flex-1 overflow-hidden">
                        <ChatView selectedChatId={selectedChatId} currentUserId={currentUserId} />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
                        <MessageSquare size={48} className="mb-2 opacity-50" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Management() {
    const { user, isAuthenticated, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        const role = user?.role?.toUpperCase();
        if (!role || (!role.includes('ADMIN'))) {
            toast.error("Access Restricted: Administrators Only");
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogout = async () => {
        try {
            await logoutUserApi();
            await logout();
            navigate('/login');
        } catch (e) {
            console.error("Logout error", e);
            await logout();
            navigate('/login');
        }
    };

    const handleStartChat = async (userId) => {
        try {
            const chat = await createOrGetChat(userId);
            setSelectedChatId(chat._id);
            setActiveTab('messages');
        } catch (e) {
            toast.error("Failed to start chat");
        }
    };

    if (!user) return null;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'assets', label: 'Asset Management', icon: Building },
        { id: 'categories', label: 'Category Management', icon: Layers },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'bookings', label: 'Booking Management', icon: CalendarCheck },
        { id: 'payments', label: 'Payments & Refunds', icon: CreditCard },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'logs', label: 'Audit Logs', icon: FileText },
    ];

    return (
        <div className="flex h-screen bg-[#F5F7FA] font-sans">
            <aside className={`bg-[#008080] text-white flex flex-col transition-all duration-300 shadow-xl z-20 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                    {!sidebarCollapsed && <h1 className="font-bold text-lg tracking-wide">VaultLease Admin</h1>}
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1 hover:bg-white/10 rounded">
                        {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-4 space-y-1">
                    {navItems.map(item => (
                        <SidebarItem key={item.id} {...item} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} collapsed={sidebarCollapsed} />
                    ))}
                </div>
                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout} className={`flex items-center gap-3 text-white/80 hover:text-white w-full ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut size={20} />
                        {!sidebarCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 bg-white shadow-sm z-10 flex items-center justify-between px-8">
                    <h2 className="text-xl font-bold text-gray-800 capitalize">{navItems.find(i => i.id === activeTab)?.label}</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-[#008080] text-white rounded-full flex items-center justify-center font-bold shadow-md shadow-[#008080]/20">
                            {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
                    {activeTab === 'dashboard' && <DashboardView />}
                    {activeTab === 'assets' && <AssetsView />}
                    {activeTab === 'categories' && <CategoriesView />}
                    {activeTab === 'users' && <UsersView onStartChat={handleStartChat} />}
                    {activeTab === 'bookings' && <BookingsView />}
                    {activeTab === 'payments' && <PaymentsView />}

                    {activeTab === 'logs' && <AuditLogsView />}
                    {activeTab === 'messages' && (
                        <MessagesView
                            selectedChatId={selectedChatId}
                            onSelectChat={setSelectedChatId}
                            currentUserId={user._id}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
