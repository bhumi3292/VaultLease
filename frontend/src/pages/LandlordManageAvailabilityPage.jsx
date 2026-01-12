// src/pages/LandlordManageAvailabilityPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { toast, ToastContainer } from 'react-toastify';
import { ChevronLeft, Plus, Trash2, Edit, Calendar as CalendarIcon, Clock, Info, Loader, X } from 'lucide-react';
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

export default function LandlordManageAvailabilityPage() {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: isLoadingAuth } = useContext(AuthContext);

    const [property, setProperty] = useState(null);
    const [loadingProperty, setLoadingProperty] = useState(true);
    const [loadingAvailabilities, setLoadingAvailabilities] = useState(true);
    const [error, setError] = useState(null);

    const [availabilitiesMap, setAvailabilitiesMap] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tempTimeSlotInput, setTempTimeSlotInput] = useState('');
    const [selectedDateSlots, setSelectedDateSlots] = useState([]);
    const [currentAvailabilityId, setCurrentAvailabilityId] = useState(null); // Availability ID for selected date
    const [isSaving, setIsSaving] = useState(false); // Loading state for save/delete operations

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuthenticated || isLoadingAuth) return; // Wait for authentication status to resolve

            // Redirect if user is not a landlord
            if (user?.role !== 'Landlord') {
                toast.error('Access denied. Landlord role required.');
                navigate('/dashboard');
                return;
            }

            try {
                const propRes = await getOnePropertyApi(propertyId);
                if (propRes.data.data.landlord._id !== user._id) {
                    toast.error('You do not own this property.');
                    navigate('/dashboard');
                    return;
                }
                setProperty(propRes.data.data);

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

                setLoadingProperty(false);
                setLoadingAvailabilities(false);
            } catch (err) {
                console.error("Error fetching landlord data:", err);
                setError(err.message || 'Failed to load data.');
                setLoadingProperty(false);
                setLoadingAvailabilities(false);
            }
        };

        // Only run fetchData once authentication status is determined
        if (!isLoadingAuth) {
            fetchData();
        }
    }, [propertyId, user, isAuthenticated, isLoadingAuth, navigate]);

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
                return 'has-availability'; // This class should be defined in global CSS
            }
        }
        return null;
    }, [availabilitiesMap]);

    const handleAddSlot = () => {
        const newSlot = tempTimeSlotInput.trim();
        if (newSlot && !selectedDateSlots.includes(newSlot)) {
            setSelectedDateSlots(prev => [...prev, newSlot].sort()); // Add and sort
            setTempTimeSlotInput(''); // Clear input
        } else if (selectedDateSlots.includes(newSlot)) {
            toast.warn("Slot already exists!");
        }
    };

    const handleRemoveSlot = (slotToRemove) => {
        setSelectedDateSlots(prev => prev.filter(slot => slot !== slotToRemove));
    };

    const handleSaveAvailability = async () => {
        if (!selectedDate) {
            toast.error('Please select a date.');
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
            setCurrentAvailabilityId(result.availability._id); // Update current ID
            toast.success('Availability saved successfully!');
        } catch (err) {
            toast.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAvailability = async () => {
        if (!currentAvailabilityId) {
            toast.warn('No availability to delete for this date.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete all availability for this date? This cannot be undone if there are no bookings.')) {
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
            toast.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingProperty || isLoadingAuth || loadingAvailabilities) return <div className="flex justify-center items-center h-screen bg-gray-50"><Loader size={32} className="animate-spin mr-2" /> Loading management page...</div>;
    if (error) return <div className="text-red-500 text-xl p-4">{error}</div>;
    if (!property) return <div className="text-yellow-600">Property not found or unauthorized access.</div>;

    return (
        <div className="min-h-screen bg-[#e6f0ff] py-10 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center mb-6 border-b pb-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 mr-4">
                        <ChevronLeft size={28} /> {/* Back button */}
                    </button>
                    <h1 className="text-3xl font-extrabold text-[#003366]">Manage Availability for "{property.title}"</h1>
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
                                placeholder="e.g., 10:30 AM"
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
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}