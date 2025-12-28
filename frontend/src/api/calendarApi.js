// src/api/calendarApi.js
import api from './api';

export const getAvailableSlotsForPropertyApi = async (propertyId, date) => {
    try {
        const response = await api.get(`/api/calendar/properties/${propertyId}/available-slots`, {
            params: { date }
        });
        return response.data.availableSlots;
    } catch (error) {
        console.error('Error fetching available slots:', error);
        throw error.response?.data?.message || 'Failed to fetch available slots.';
    }
};

export const bookVisitApi = async ({ propertyId, date, timeSlot }) => {
    try {
        const response = await api.post('/api/calendar/book-visit', {
            propertyId,
            date,
            timeSlot,
        });
        return response.data; // Should return { success: true, message: '...', booking: {...} }
    } catch (error) {
        console.error('Error booking visit:', error);
        throw error.response?.data?.message || 'Failed to book visit.';
    }
};

// --- Other calendar-related API functions (already provided, included for completeness) ---

/**
 * Fetches all bookings for the current authenticated tenant.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of tenant bookings.
 */
export const getTenantBookingsApi = async () => {
    try {
        const response = await api.get('/api/calendar/tenant/bookings');
        return response.data.bookings;
    } catch (error) {
        console.error('Error fetching tenant bookings:', error);
        throw error.response?.data?.message || 'Failed to fetch tenant bookings.';
    }
};


export const cancelBookingApi = async (bookingId) => {
    try {
        const response = await api.delete(`/api/calendar/bookings/${bookingId}`); // Backend uses DELETE for cancellation
        return response.data; // Should return { success: true, message: '...' }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error.response?.data?.message || 'Failed to cancel booking.';
    }
};

export const getLandlordAvailabilitiesApi = async () => {
    try {
        const response = await api.get('/api/calendar/landlord/availabilities');
        return response.data.availabilities;
    } catch (error) {
        console.error('Error fetching landlord availabilities:', error);
        throw error.response?.data?.message || 'Failed to fetch landlord availabilities.';
    }
};

export const upsertAvailabilityApi = async ({ propertyId, date, timeSlots }, availabilityId = null) => {
    try {
        let response;
        if (availabilityId) {
            response = await api.put(`/api/calendar/availabilities/${availabilityId}`, { timeSlots });
        } else {
            response = await api.post('/api/calendar/availabilities', { propertyId, date, timeSlots });
        }
        return response.data;
    } catch (error) {
        console.error('Error upserting availability:', error);
        throw error.response?.data?.message || 'Failed to manage availability.';
    }
};

export const deleteAvailabilityApi = async (availabilityId) => {
    try {
        const response = await api.delete(`/api/calendar/availabilities/${availabilityId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting availability:', error);
        throw error.response?.data?.message || 'Failed to delete availability.';
    }
};

export const getLandlordBookingsApi = async () => {
    try {
        const response = await api.get('/api/calendar/landlord/bookings');
        return response.data.bookings;
    } catch (error) {
        console.error('Error fetching landlord bookings:', error);
        throw error.response?.data?.message || 'Failed to fetch landlord bookings.';
    }
};

export const updateBookingStatusApi = async (bookingId, status) => {
    try {
        const response = await api.put(`/api/calendar/bookings/${bookingId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error.response?.data?.message || 'Failed to update booking status.';
    }
};