import axiosInstance from './api';

export const createBookingApi = async (bookingData) => {
    return await axiosInstance.post('/api/booking/create', bookingData);
};

export const getMyBookingsApi = async () => {
    return await axiosInstance.get('/api/booking/my-bookings');
};

export const getAllBookingsApi = async () => {
    return await axiosInstance.get('/api/booking/all');
};

export const updateBookingStatusApi = async (id, status) => {
    return await axiosInstance.put(`/api/booking/${id}/status`, { status });
};
