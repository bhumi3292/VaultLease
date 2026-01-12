import axios from './api';

// USERS
export const getAllUsersApi = () => axios.get('/api/users');
export const getUserByIdApi = (id) => axios.get(`/api/users/${id}`);
export const createUserApi = (data) => axios.post('/api/users', data);
export const updateUserApi = (id, data) => axios.put(`/api/users/${id}`, data);
export const deleteUserApi = (id) => axios.delete(`/api/users/${id}`);
export const updateUserStatusApi = (id, data) => axios.put(`/api/users/status/${id}`, data);
export const getAuditLogsApi = () => axios.get('/api/users/logs');

// PAYMENTS (Admin)
export const getAllPaymentsApi = () => axios.get('/api/payments/all');
export const updatePaymentStatusApi = (id, status) => axios.put(`/api/payments/status/${id}`, { status });

// STATS (Admin)
export const getDashboardStatsApi = () => axios.get('/api/stats/dashboard');
