import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/destionation.css";

const destinations = [
    { city: "New York", count: "1,234" },
    { city: "Los Angeles", count: "856" },
    { city: "Miami", count: "642" },
    { city: "San Francisco", count: "789" },

];

export default function PopularDestinations() {
    const navigate = useNavigate();

    const handleClick = (city) => {
        navigate(`/property/${city}`);
    };

    return (
        <section className="popular-destinations-section">
            <div className="container">
                <h2 className="title">Popular Destinations</h2>
                <p className="subtitle">Explore our most sought-after locations</p>

                <div className="destinations-grid">
                    {destinations.map((d) => (
                        <div key={d.city} className="destination-card" onClick={() => handleClick(d.city)}>
                            <div className="image-placeholder" />
                            <div className="destination-info">
                                <strong>{d.city}</strong>
                                <span>{d.count} properties</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
