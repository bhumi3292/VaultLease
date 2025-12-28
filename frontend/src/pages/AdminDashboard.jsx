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

                {/* User Management */}
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
            </div>
        </div>
    );
}