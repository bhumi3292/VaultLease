// src/components/BookingModal.jsx
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { X, Clock, Info, Home, Calendar as CalendarIcon, CheckCircle, Loader } from 'lucide-react';

const BookingModal = ({
                          show,
                          onClose,
                          propertyTitle,
                          propertyId,
                          landlordId,
                          isAuthenticated,
                          selectedDate,
                          handleDateChange,
                          currentDaySlots,
                          selectedTime,
                          handleSlotSelect,
                          handleConfirmBooking,
                          loadingAvailability,
                          isBookingLoading,
                          bookingSuccess,
                          availableSlots // Corrected prop name: 'availableSlots'
                      }) => {
    if (!show) return null;
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toISOString().split('T')[0];
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            if (date.getTime() >= today.getTime() && availableSlots[dateString] && availableSlots[dateString].length > 0) {
                return 'has-availability';
            }
        }
        return null; // No custom class
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl transform scale-100 opacity-100 transition-all duration-300">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-[#003366]">Book a Visit for "{propertyTitle}"</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={28} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Selection Section */}
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold text-[#003366] mb-4">Select a Date</h3>
                        <Calendar
                            onChange={handleDateChange}
                            value={selectedDate}
                            minDate={new Date()} // Prevent selecting past dates
                            tileClassName={tileClassName} // Apply custom highlighting
                        />
                        <p className="text-sm text-gray-600 mt-3 flex items-center">
                            <Info size={16} className="mr-2 text-blue-500" />
                            Dates with available slots are highlighted.
                        </p>
                    </div>

                    {/* Time Slot Selection & Booking Summary Section */}
                    <div className="p-4 bg-gray-50 rounded-lg shadow-inner flex flex-col">
                        <h3 className="text-xl font-semibold text-[#003366] mb-4">Select a Time Slot</h3>
                        {loadingAvailability ? (
                            <div className="text-center text-gray-600 flex items-center justify-center py-4">
                                <Loader size={20} className="animate-spin mr-2" /> Loading availability...
                            </div>
                        ) : (
                            <>
                                {selectedDate ? (
                                    currentDaySlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-48 mb-4">
                                            {currentDaySlots.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSlotSelect(slot)}
                                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
                                                        ${selectedTime === slot ? 'bg-[#003366] text-white border-[#003366] shadow-md' : 'bg-white text-[#003366] border-gray-300 hover:bg-gray-100'}`}
                                                >
                                                    <Clock size={16} className="inline-block mr-1" /> {slot}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-600 text-center py-4">No available slots for this date.</p>
                                    )
                                ) : (
                                    <p className="text-gray-600 text-center py-4">Please select a date on the calendar.</p>
                                )}
                            </>
                        )}

                        {/* Booking Summary and Confirm Button */}
                        {selectedDate && selectedTime && (
                            <div className="mt-auto p-4 bg-[#e6f0ff] rounded-lg border border-[#cce0ff] text-[#003366]">
                                <h4 className="font-semibold text-lg mb-2 flex items-center"><Info size={20} className="mr-2" />Booking Summary:</h4>
                                <p className="mb-1 flex items-center"><Home size={18} className="mr-2 text-[#003366]" /> Property: <span className="font-medium ml-1">{propertyTitle}</span></p>
                                <p className="mb-1 flex items-center"><CalendarIcon size={18} className="mr-2 text-[#003366]" /> Date: <span className="font-medium ml-1">{selectedDate.toLocaleDateString()}</span></p>
                                <p className="mb-3 flex items-center"><Clock size={18} className="mr-2 text-[#003366]" /> Time: <span className="font-medium ml-1">{selectedTime}</span></p>

                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={bookingSuccess || isBookingLoading} // Disable if already booked or loading
                                    className={`w-full py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center
                                        ${bookingSuccess ? 'bg-green-500 text-white cursor-not-allowed opacity-70' : // Green if successful
                                        isBookingLoading ? 'bg-[#003366] text-white opacity-70 cursor-not-allowed' : // Dimmed if loading
                                            'bg-[#003366] text-white hover:bg-[#002244] shadow-md transform hover:scale-105'}`} // Normal style
                                >
                                    {isBookingLoading ? (
                                        <><Loader size={20} className="animate-spin mr-2" /> Booking...</>
                                    ) : bookingSuccess ? (
                                        <><CheckCircle size={20} className="inline-block mr-2" /> Booking Confirmed!</>
                                    ) : (
                                        'Confirm Booking'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;