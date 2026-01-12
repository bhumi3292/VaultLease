// src/pages/Booking_Details.jsx
import React, { useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AuthContext } from '../auth/AuthProvider';
import {
    getTenantBookingsApi,
    getLandlordBookingsApi,
    cancelBookingApi,
    updateBookingStatusApi
} from '../api/calendarApi';
import { Home, Calendar as CalendarIcon, Clock, User, Info, CheckCircle, XCircle, Loader, CircleSlash } from 'lucide-react';
import { API_URL } from '../api/api';

const BookingDetailsPage = () => {
    const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const queryClient = useQueryClient();

    // Determine which query to run based on user role
    const { data: bookings, isLoading, isError, error } = useQuery({
        queryKey: ['bookings', user?.role], // Query key depends on role
        queryFn: async () => {
            if (!isAuthenticated) return [];
            if (user.role === 'Tenant') {
                return await getTenantBookingsApi();
            } else if (user.role === 'Landlord') {
                return await getLandlordBookingsApi();
            }
            return []; // Should not happen if isAuthenticated and role is checked
        },
        enabled: isAuthenticated && !authLoading && !!user?.role, // Only run query when authenticated and role is known
        refetchOnWindowFocus: true,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    // Mutation for tenant to cancel a booking
    const cancelBookingMutation = useMutation({
        mutationFn: cancelBookingApi,
        onSuccess: (data, variables) => {
            toast.success(data.message || 'Booking cancelled successfully!');
            // Invalidate queries to refetch the latest bookings and availabilities
            queryClient.invalidateQueries(['bookings', user?.role]);
            queryClient.invalidateQueries(['availabilities']); // Crucial to update landlord's availability view
        },
        onError: (err) => {
            toast.error(err || 'Failed to cancel booking.');
        },
    });

    const updateBookingStatusMutation = useMutation({
        mutationFn: ({ bookingId, status }) => updateBookingStatusApi(bookingId, status),
        onSuccess: (data, variables) => {
            toast.success(data.message || `Booking status updated to ${variables.status.toLowerCase()}!`);
            // Invalidate queries to refetch the latest bookings and availabilities
            queryClient.invalidateQueries(['bookings', user?.role]);
            queryClient.invalidateQueries(['availabilities']); // Crucial to update availability if cancelled
        },
        onError: (err) => {
            toast.error(err || 'Failed to update booking status.');
        },
    });

    const handleCancelBooking = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            cancelBookingMutation.mutate(bookingId);
        }
    };

    const handleStatusChange = (bookingId, newStatus) => {
        if (window.confirm(`Are you sure you want to change this booking status to "${newStatus}"?`)) {
            updateBookingStatusMutation.mutate({ bookingId, status: newStatus });
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'rejected': return 'bg-gray-100 text-gray-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Loader className="animate-spin text-[#003366]" size={48} />
                <p className="ml-4 text-gray-700 text-xl">Loading bookings...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 text-red-600 text-xl">
                Error loading bookings: {error.message || 'Unknown error.'}
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 text-gray-700 text-xl">
                Please log in to view your bookings.
            </div>
        );
    }

    const isLandlord = user.role === 'Landlord';
    const isTenant = user.role === 'Tenant';

    return (
        <div className="container mx-auto px-4 py-8 bg-white shadow-lg rounded-xl mt-8 mb-8">
            <h1 className="text-4xl font-bold text-[#003366] mb-8 border-b pb-4">
                {isLandlord ? 'Your Property Bookings' : 'Your Scheduled Visits'}
            </h1>

            {!bookings || bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-600 text-xl">
                    <Info size={40} className="mx-auto mb-4 text-gray-400" />
                    {isLandlord ? 'No bookings have been made for your properties yet.' : 'You have no scheduled visits.'}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center mb-4">
                                {booking.property?.images?.[0] ? (
                                    <img
                                        src={`${API_URL}/uploads/${booking.property.images[0]}`}
                                        alt={booking.property.title}
                                        className="w-16 h-16 object-cover rounded-md mr-4"
                                    />
                                ) : (
                                    <div className="w-16 h-16 flex items-center justify-center bg-gray-200 rounded-md mr-4 text-gray-500">
                                        <Home size={24} />
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-[#003366]">{booking.property?.title || 'Unknown Property'}</h3>
                            </div>

                            <div className="space-y-2 text-gray-700 text-base mb-4">
                                <p className="flex items-center"><CalendarIcon size={18} className="mr-2 text-blue-500" /> Date: <span className="font-medium ml-1">{new Date(booking.date).toLocaleDateString()}</span></p>
                                <p className="flex items-center"><Clock size={18} className="mr-2 text-blue-500" /> Time: <span className="font-medium ml-1">{booking.timeSlot}</span></p>
                                {isLandlord && (
                                    <p className="flex items-center">
                                        <User size={18} className="mr-2 text-purple-500" /> Booked by:
                                        <span className="font-medium ml-1"> {booking.tenant?.fullName || 'N/A'} ({booking.tenant?.email || 'N/A'})</span>
                                    </p>
                                )}
                                <p className="flex items-center">
                                    <Info size={18} className="mr-2 text-gray-500" /> Status:
                                    <span className={`font-semibold ml-1 px-2 py-1 rounded-full text-xs ${getStatusClass(booking.status.toLowerCase())}`}>
                                        {booking.status}
                                    </span>
                                </p>
                            </div>

                            {isTenant && booking.status === 'pending' && (
                                <button
                                    onClick={() => handleCancelBooking(booking._id)}
                                    disabled={cancelBookingMutation.isLoading}
                                    className="w-full mt-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center font-medium"
                                >
                                    {cancelBookingMutation.isLoading ? (
                                        <><Loader size={20} className="animate-spin mr-2" /> Cancelling...</>
                                    ) : (
                                        <><CircleSlash size={20} className="mr-2" /> Cancel Booking</>
                                    )}
                                </button>
                            )}

                            {/* Landlord Actions */}
                            {isLandlord && booking.status !== 'cancelled' && booking.status !== 'rejected' && (
                                <div className="mt-4 flex gap-2">
                                    {booking.status !== 'confirmed' && (
                                        <button
                                            onClick={() => handleStatusChange(booking._id, 'Confirmed')}
                                            disabled={updateBookingStatusMutation.isLoading}
                                            className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center text-sm font-medium"
                                        >
                                            {updateBookingStatusMutation.isLoading ? <Loader size={16} className="animate-spin mr-1" /> : <CheckCircle size={16} className="mr-1" />} Confirm
                                        </button>
                                    )}
                                    {booking.status !== 'rejected' && (
                                        <button
                                            onClick={() => handleStatusChange(booking._id, 'Rejected')}
                                            disabled={updateBookingStatusMutation.isLoading}
                                            className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center text-sm font-medium"
                                        >
                                            {updateBookingStatusMutation.isLoading ? <Loader size={16} className="animate-spin mr-1" /> : <XCircle size={16} className="mr-1" />} Reject
                                        </button>
                                    )}
                                    {/* Landlord can also cancel a booking by setting status to 'Cancelled' */}
                                    {booking.status !== 'cancelled' && (
                                        <button
                                            onClick={() => handleStatusChange(booking._id, 'Cancelled')}
                                            disabled={updateBookingStatusMutation.isLoading}
                                            className="flex-1 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center text-sm font-medium"
                                        >
                                            {updateBookingStatusMutation.isLoading ? <Loader size={16} className="animate-spin mr-1" /> : <CircleSlash size={16} className="mr-1" />} Cancel
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingDetailsPage;