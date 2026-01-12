import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import Navbar from "../layouts/navbar.jsx";
import "../styles/agreement.css"; // Import styles

const Agreement = () => {
    const [isChecked, setIsChecked] = useState(false);
    const navigate = useNavigate(); // Initialize navigation

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const handleAgreeAndContinue = () => {
        if (isChecked) {
            navigate("/signup", { state: { agreed: true } }); // Navigate with state
        } else {
            alert("You must agree to the Terms and Conditions before continuing.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="agreement-container">
                <h3>Terms and Conditions</h3>
                <div className="terms-box">
                    <p>By signing up for VaultLease, you agree to the following terms:</p>
                    <ul>
                        <li>You must provide accurate account information.</li>
                        <li>VaultLease is not liable for rental disputes.</li>
                        <li>All transactions are final and processed securely.</li>
                        <li>Misuse of the platform may result in account suspension.</li>
                        <li>We respect your privacy and protect your data.</li>
                        <li>VaultLease reserves the right to modify these terms.</li>
                    </ul>
                </div>
                <div className="checkbox-container">
                    <input
                        type="checkbox"
                        id="agree"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor="agree">
                        I have read and agree to the Terms and Conditions of VaultLease.
                    </label>
                </div>
                <button className="agree-button" onClick={handleAgreeAndContinue}>
                    Agree and Continue
                </button>
            </div>
        </>
    );
};

export default Agreement;
