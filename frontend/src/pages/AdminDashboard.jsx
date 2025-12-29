import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, Shield, BookOpen, Activity, Search, Trash2, UserPlus } from 'lucide-react';
import Navbar from '../layouts/Navbar';

export default function AdminDashboard() {
    const { user, isAuthenticated, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users', 'departments', 'requests', 'audit'
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
        if (!loading && user && user.role !== 'ADMIN') {
            toast.error("Unauthorized. Admin access required.");
            navigate('/');
        }
    }, [isAuthenticated, loading, user, navigate]);

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchUsers();
            fetchDepartments();
            fetchRequests();
            fetchAuditLogs();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            // Assuming we have a route to get all users. If not, we might need one.
            // Using a hypothetical endpoint or existing userController endpoint.
            // userController.getAllUsers usually exists.
            const response = await axios.get('http://localhost:3001/api/users', { // Verify route
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            // toast.error("Failed to load users");
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setDepartments(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/access/all-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRequests(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/audit-logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAuditLogs(response.data.data.logs);
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        }
    };

    const handleCreateDepartment = async () => {
        const name = prompt("Enter Department Name:");
        if (!name) return;
        const description = prompt("Enter Description:");

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3001/api/departments',
                { name, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Department created");
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create department");
        }
    };

    const handleDeleteDepartment = async (id) => {
        if (!window.confirm("Delete this department?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/api/departments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Department deleted");
            fetchDepartments();
        } catch (error) {
            toast.error("Failed to delete department");
        }
    };

    const handleRoleUpdate = async (userId, newRole, department) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3001/api/users/${userId}`,
                { role: newRole, department },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("User updated successfully");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || isLoadingData) return <div className="p-10 text-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-body">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">System Administration</h1>
                    <p className="text-gray-500">Manage users, departments, and system settings.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Users size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                            <div className="text-sm text-gray-500">Total Users</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Shield size={24} /></div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {users.filter(u => u.role === 'ADMINISTRATOR').length}
                            </div>
                            <div className="text-sm text-gray-500">Administrators</div>
                        </div>
                    </div>
                    {/* More stats can be added */}
                </div>

            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    className={`pb-2 px-1 font-medium ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={`pb-2 px-1 font-medium ${activeTab === 'departments' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('departments')}
                >
                    Departments
                </button>
                <button
                    className={`pb-2 px-1 font-medium ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('requests')}
                >
                    All Requests
                </button>
                <button
                    className={`pb-2 px-1 font-medium ${activeTab === 'audit' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('audit')}
                >
                    Audit Logs
                </button>
            </div>

            {/* Content */}
            {activeTab === 'users' && (
                /* User Management */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map(u => (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{u.fullName}</div>
                                            <div className="text-xs text-gray-500">{u.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                u.role === 'ADMINISTRATOR' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {u.department || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Demo actions for changing roles */}
                                                {u.role !== 'ADMIN' && (
                                                    <button
                                                        onClick={() => {
                                                            const dept = prompt("Enter Department for Administrator:");
                                                            if (dept) handleRoleUpdate(u._id, 'ADMINISTRATOR', dept);
                                                        }}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Make Admin
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'departments' && (
                /* Department Management */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Department Management</h2>
                        <button onClick={handleCreateDepartment} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary-hover flex items-center gap-2">
                            <UserPlus size={16} /> Add Department
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Head of Dept</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {departments.map(dept => (
                                    <tr key={dept._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-900">{dept.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{dept.description || '-'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {dept.headOfDepartment ? (
                                                <div>
                                                    <div className="font-medium text-gray-900">{dept.headOfDepartment.fullName}</div>
                                                    <div className="text-xs text-gray-500">{dept.headOfDepartment.email}</div>
                                                </div>
                                            ) : <span className="text-gray-400 italic">Not Assigned</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDeleteDepartment(dept._id)} className="text-red-500 hover:text-red-700 p-2">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {departments.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No departments found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'requests' && (
                /* Global Request Log */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">System-Wide Borrow Requests</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Asset</th>
                                    <th className="px-6 py-4">Requester</th>
                                    <th className="px-6 py-4">Dates</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.map(req => (
                                    <tr key={req._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{req.asset?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{req.asset?.serialNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium">{req.requester?.fullName}</div>
                                            <div className="text-xs text-gray-500">{req.requester?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(req.startDate).toLocaleDateString()} - {new Date(req.expectedReturnDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                req.status === 'Approved' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    req.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'audit' && (
                /* Audit Logs */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">System Activity Logs</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {auditLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{log.user?.fullName || 'System'}</div>
                                            <div className="text-xs text-gray-500">{log.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-gray-100 text-xs font-mono font-bold">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {log.entity} <span className="text-xs text-gray-400">({log.entityId?.substring(0, 8)}...)</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                                            {JSON.stringify(log.details)}
                                        </td>
                                    </tr>
                                ))}
                                {auditLogs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No activity recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}