// src/components/LandlordManageAvailabilityModal.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast, ToastContainer } from 'react-toastify';
import { X, Plus, Trash2, Edit, Calendar as CalendarIcon, Clock, Info, Loader } from 'lucide-react';
import { AuthContext } from '../auth/AuthProvider';
import {
    getLandlordAvailabilitiesApi,
    upsertAvailabilityApi,
    deleteAvailabilityApi
} from '../api/calendarApi';
import { getOnePropertyApi } from '../api/propertyApi';

const normalizeDate = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
};

const LandlordManageAvailabilityModal = ({ show, onClose, propertyId }) => {
    const { user, isAuthenticated, loading: isLoadingAuth } = useContext(AuthContext);

    const [propertyTitle, setPropertyTitle] = useState('Loading Property...');
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);

    const [availabilitiesMap, setAvailabilitiesMap] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tempTimeSlotInput, setTempTimeSlotInput] = useState('');
    const [selectedDateSlots, setSelectedDateSlots] = useState([]);
    const [currentAvailabilityId, setCurrentAvailabilityId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!show) return;

        const fetchData = async () => {
            setLoadingData(true);
            setError(null);

            if (!isAuthenticated || isLoadingAuth) {
                toast.error('Authentication required to manage availability.');
                onClose();
                return;
            }

            if (user?.role !== 'Landlord') {
                toast.error('Access denied. Landlord role required.');
                onClose();
                return;
            }

            try {
                const propRes = await getOnePropertyApi(propertyId);
                if (propRes.data.data.landlord._id !== user._id) {
                    toast.error('You do not own this property.');
                    onClose(); // Close if not owner
                    return;
                }
                setPropertyTitle(propRes.data.data.title);

                const landlordAvailabilities = await getLandlordAvailabilitiesApi();
                const filteredAvailabilities = landlordAvailabilities.filter(
                    (avail) => avail.property._id === propertyId
                );

                const map = {};
                filteredAvailabilities.forEach(avail => {
                    map[normalizeDate(avail.date)] = {
                        _id: avail._id,
                        timeSlots: avail.timeSlots
                    };
                });
                setAvailabilitiesMap(map);

            } catch (err) {
                console.error("Error fetching landlord data:", err);
                setError(err.response?.data?.message || 'Failed to load availability data.');
                toast.error(err.response?.data?.message || "Failed to load availability data.");
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [show, propertyId, user, isAuthenticated, isLoadingAuth, onClose]); // Depend on 'show' to refetch when modal opens

    useEffect(() => {
        if (selectedDate) {
            const normalized = normalizeDate(selectedDate);
            const currentAvail = availabilitiesMap[normalized];
            setSelectedDateSlots(currentAvail ? [...currentAvail.timeSlots] : []);
            setCurrentAvailabilityId(currentAvail ? currentAvail._id : null);
            setTempTimeSlotInput('');
        }
    }, [selectedDate, availabilitiesMap]);

    const tileClassName = useCallback(({ date, view }) => {
        if (view === 'month') {
            const dateString = normalizeDate(date);
            if (availabilitiesMap[dateString] && availabilitiesMap[dateString].timeSlots.length > 0) {
                return 'has-availability'; // This class should be defined in global CSS (e.g., index.css)
            }
        }
        return null;
    }, [availabilitiesMap]);

    const handleAddSlot = () => {
        const newSlot = tempTimeSlotInput.trim();
        const timeRegex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])(?: (?:AM|PM))?$/i;

        if (!newSlot) {
            toast.warn("Time slot cannot be empty.");
            return;
        }
        if (!timeRegex.test(newSlot)) {
            toast.error("Invalid time format. Use HH:MM (e.g., 09:00) or HH:MM AM/PM (e.g., 02:30 PM).");
            return;
        }
        if (selectedDateSlots.includes(newSlot)) {
            toast.warn("This time slot already exists for this date.");
            return;
        }

        setSelectedDateSlots(prev => [...prev, newSlot].sort((a, b) => {
            // Simple string sort might not work for 12-hour formats like "09:00 PM" vs "10:00 AM"
            // For proper sorting, consider converting to 24-hour time or a comparable number
            // For now, assuming consistent format (e.g., all 24hr or all 12hr with AM/PM)
            return a.localeCompare(b);
        }));
        setTempTimeSlotInput('');
    };

    const handleRemoveSlot = (slotToRemove) => {
        setSelectedDateSlots(prev => prev.filter(slot => slot !== slotToRemove));
    };

    const handleSaveAvailability = async () => {
        if (!selectedDate) {
            toast.error('Please select a date.');
            return;
        }
        if (selectedDateSlots.length === 0) {
            toast.warn('Please add at least one time slot for this date, or delete the date if no availability.');
            return;
        }

        setIsSaving(true);
        try {
            const normalizedDate = normalizeDate(selectedDate);
            const result = await upsertAvailabilityApi(
                {
                    propertyId,
                    date: normalizedDate,
                    timeSlots: selectedDateSlots
                },
                currentAvailabilityId
            );

            setAvailabilitiesMap(prev => ({
                ...prev,
                [normalizedDate]: { _id: result.availability._id, timeSlots: result.availability.timeSlots }
            }));
            setCurrentAvailabilityId(result.availability._id);
            toast.success('Availability saved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save availability.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAvailability = async () => {
        if (!currentAvailabilityId) {
            toast.warn('No availability to delete for this date.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete all availability for this date? This action cannot be undone if there are active bookings for these slots.')) {
            return;
        }

        setIsSaving(true);
        try {
            await deleteAvailabilityApi(currentAvailabilityId);
            const normalizedDate = normalizeDate(selectedDate);
            setAvailabilitiesMap(prev => {
                const newMap = { ...prev };
                delete newMap[normalizedDate];
                return newMap;
            });
            setSelectedDateSlots([]);
            setCurrentAvailabilityId(null);
            toast.success('Availability deleted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete availability.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!show) return null;

    if (loadingData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl transform scale-100 opacity-100 transition-all duration-300 flex justify-center items-center h-48">
                    <Loader size={32} className="animate-spin mr-2" /> Loading management data...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl transform scale-100 opacity-100 transition-all duration-300 text-red-500 text-xl text-center">
                    Error: {error}
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl transform scale-100 opacity-100 transition-all duration-300">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-[#003366]">Manage Availability for "{propertyTitle}"</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={28} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Calendar for Date Selection */}
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold text-[#003366] mb-4">Select a Date</h3>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            minDate={new Date()}
                            tileClassName={tileClassName}
                        />
                        <p className="text-sm text-gray-600 mt-3 flex items-center">
                            <Info size={16} className="mr-2 text-blue-500" />
                            Dates with existing availability are highlighted.
                        </p>
                    </div>

                    {/* Time Slot Management Section */}
                    <div className="p-4 bg-gray-50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="text-xl font-semibold text-[#003366] mb-4">
                            Availability for: {selectedDate.toLocaleDateString()}
                        </h3>

                        {/* Display current slots for the selected date */}
                        <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto border p-2 rounded bg-white">
                            {selectedDateSlots.length > 0 ? (
                                selectedDateSlots.map((slot, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 bg-[#cce0ff] text-[#003366] rounded-full text-sm font-medium"
                                    >
                                        <Clock size={16} className="mr-1" /> {slot}
                                        <button onClick={() => handleRemoveSlot(slot)} className="ml-2 text-[#003366] hover:text-red-600">
                                            <X size={14} /> {/* Remove slot button */}
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No slots set for this date yet.</p>
                            )}
                        </div>

                        {/* Input to add new time slots */}
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={tempTimeSlotInput}
                                onChange={(e) => setTempTimeSlotInput(e.target.value)}
                                placeholder="e.g., 10:30 AM or 14:00"
                                className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-[#003366] focus:border-[#003366]"
                            />
                            <button
                                onClick={handleAddSlot}
                                className="px-4 py-2 bg-[#003366] text-white rounded-md hover:bg-[#002244] flex items-center"
                            >
                                <Plus size={20} className="mr-1" /> Add
                            </button>
                        </div>

                        {/* Save and Delete Buttons */}
                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={handleSaveAvailability}
                                disabled={isSaving}
                                className={`flex-1 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center
                                    ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}`}
                            >
                                {isSaving ? <><Loader size={20} className="animate-spin mr-2" /> Saving...</> : <><Edit size={20} className="mr-2" /> Save Availability</>}
                            </button>
                            <button
                                onClick={handleDeleteAvailability}
                                disabled={isSaving || !currentAvailabilityId} // Disable if saving or no availability for date
                                className={`flex-1 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center
                                    ${isSaving || !currentAvailabilityId ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}
                            >
                                <Trash2 size={20} className="mr-2" /> Delete Date
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* ToastContainer is placed here because this modal is rendered conditionally and might need its own */}
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
};

export default LandlordManageAvailabilityModal;