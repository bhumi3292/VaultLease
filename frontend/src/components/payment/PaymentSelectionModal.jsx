// src/components/PaymentSelectionModal.jsx
import React from 'react';
import PropTypes from 'prop-types';

import eSewaLogo from '../../assets/eSewa.png';
import khaltiLogo from '../../assets/khalti.png';

export default function PaymentSelectionModal({ show, onClose, onSelectPaymentMethod }) {

    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
                <h2 className="text-2xl font-bold text-[#003366] mb-6 text-center">Choose Payment Method</h2>

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => onSelectPaymentMethod('khalti')}
                        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-4 hover:bg-gray-200 transition-colors duration-200"
                    >
                        <img src={khaltiLogo} alt="Khalti" className="h-12 mr-4" />
                        <span className="text-xl font-semibold text-gray-800">Pay with Khalti</span>
                    </button>

                    <button
                        onClick={() => onSelectPaymentMethod('esewa')}
                        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-4 hover:bg-gray-200 transition-colors duration-200"
                    >
                        <img src={eSewaLogo} alt="eSewa" className="h-12 mr-4" />
                        <span className="text-xl font-semibold text-gray-800">Pay with eSewa</span>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}

PaymentSelectionModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelectPaymentMethod: PropTypes.func.isRequired,
};