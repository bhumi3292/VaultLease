// src/hooks/useBookingModal.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAvailableSlotsForPropertyApi, bookVisitApi } from '../api/calendarApi';

export const useBookingModal = (propertyId, landlordId, isAuthenticated) => {
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    // Corrected state variable name: 'availableSlots'
    const [availableSlots, setAvailableSlots] = useState({}); // Stores { 'YYYY-MM-DD': ['time1', 'time2'] }
    const [selectedTime, setSelectedTime] = useState(null);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [isBookingLoading, setIsBookingLoading] = useState(false);

    const fetchSlotsForDate = useCallback(async (date) => {
        if (!propertyId || !date) return;

        setLoadingAvailability(true);
        try {
            const formattedDate = date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
            const slots = await getAvailableSlotsForPropertyApi(propertyId, formattedDate);
            setAvailableSlots(prev => ({ ...prev, [formattedDate]: slots }));
        } catch (err) {
            toast.error(err);
            console.error("Availability fetch error:", err);
            setAvailableSlots({}); // Clear slots on error
        } finally {
            setLoadingAvailability(false);
        }
    }, [propertyId]);

    // Opens the booking modal, performing initial checks
    const handleOpenBookingModal = useCallback(() => {
        if (!isAuthenticated) {
            toast.warn('Please log in to book a visit.');
            return;
        }
        if (!landlordId) {
            toast.error('Landlord information is missing. Cannot book a visit.');
            return;
        }
        setSelectedDate(null);
        setSelectedTime(null);
        setBookingSuccess(false);
        setIsBookingLoading(false);
        setShowBookingModal(true);
    }, [isAuthenticated, landlordId]);

    // Closes the booking modal and resets its state
    const handleCloseBookingModal = useCallback(() => {
        setShowBookingModal(false);
        setSelectedDate(null);
        setSelectedTime(null);
        setBookingSuccess(false);
        setAvailableSlots({}); // Clear fetched slots on close
        setIsBookingLoading(false);
    }, []);

    const handleDateChange = useCallback((date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
        setBookingSuccess(false);
        if (date) {
            fetchSlotsForDate(date); // Fetch slots for the newly selected date
        }
    }, [fetchSlotsForDate]);

    // Handles time slot selection
    const handleSlotSelect = useCallback((time) => {
        setSelectedTime(time);
        setBookingSuccess(false);
    }, []);

    // Handles the final booking confirmation
    const handleConfirmBooking = useCallback(async () => {
        if (!selectedDate || !selectedTime) {
            toast.error('Please select both a date and a time.');
            return;
        }
        if (!propertyId || !landlordId) {
            toast.error('Missing property or landlord information for booking.');
            return;
        }

        setIsBookingLoading(true);
        try {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const bookingDetails = {
                propertyId: propertyId,
                date: formattedDate,
                timeSlot: selectedTime,
            };
            const result = await bookVisitApi(bookingDetails);
            if (result.success) {
                setBookingSuccess(true);
                toast.success('Your visit has been successfully booked!');
                fetchSlotsForDate(selectedDate); // Re-fetch slots to reflect the new booking
            }
        } catch (error) {
            toast.error(error); // Error message already user-friendly from API service
        } finally {
            setIsBookingLoading(false);
        }
    }, [selectedDate, selectedTime, propertyId, landlordId, fetchSlotsForDate]);

    // Derive current day slots from the 'availableSlots' map
    const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
    const currentDaySlots = formattedDate ? (availableSlots[formattedDate] || []) : [];

    return {
        showBookingModal,
        handleOpenBookingModal,
        handleCloseBookingModal,
        selectedDate,
        handleDateChange,
        currentDaySlots,
        selectedTime,
        handleSlotSelect,
        handleConfirmBooking,
        loadingAvailability,
        isBookingLoading,
        bookingSuccess,
        availableSlots
    };
};