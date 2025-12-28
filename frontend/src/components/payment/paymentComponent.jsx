

import React from 'react';
import PropTypes from 'prop-types';
import { useEsewaPayment } from '../../hooks/payment/useEsewaPayment'; // Adjust path as needed
import { toast } from 'react-toastify'; // Make sure react-toastify is configured

const PropertyPage = ({ propertyId, propertyPrice, propertyName }) => {
    const { initiateEsewaPayment, isProcessingEsewaPayment } = useEsewaPayment();

    const handlePayWithEsewa = () => {
        if (!propertyId || !propertyPrice || !propertyName) {
            toast.error("Property details are incomplete for payment.");
            return;
        }

        initiateEsewaPayment(
            propertyId,
            propertyPrice,
            `Premium Listing for ${propertyName}`,
            'property_listing_fee'
        );
    };

    return (
        <div className="p-4 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Property Details</h2>
            <p>Property Name: {propertyName}</p>
            <p>Price: Rs. {propertyPrice}</p>
            {/* ... other property details */}

            <button
                onClick={handlePayWithEsewa}
                disabled={isProcessingEsewaPayment} // Disable button while processing
                className={`mt-4 px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200 ${
                    isProcessingEsewaPayment ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
            >
                {isProcessingEsewaPayment ? "Processing Payment..." : "Pay with eSewa"}
            </button>
        </div>
    );
};

PropertyPage.propTypes = {
    propertyId: PropTypes.string.isRequired,
    propertyPrice: PropTypes.number.isRequired,
    propertyName: PropTypes.string.isRequired,
};

export default PropertyPage;
