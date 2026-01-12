import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Navbar from '../layouts/navbar.jsx';
import {
    getCartService,
    removeFromCartService
} from '../services/cartService.js';
import { API_URL } from '../api/api.js';

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await getCartService();
            // Ensure data.items is an array and filter out any null/undefined items
            const validItems = res.data?.items?.filter(item => item && item.property) || [];
            setCartItems(validItems);
        } catch (err) {
            setError("Failed to load cart items.");
            toast.error("Error fetching cart");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (property) => {
        navigate(`/property/${property._id}`, { state: { property } });
    };

    const handleRemove = async (propertyId) => {
        try {
            await removeFromCartService(propertyId);
            setCartItems(prev => prev.filter(item => item.property._id !== propertyId));
            toast.success("Property removed from cart!");
        } catch (err) {
            toast.error("Failed to remove from cart");
        }
    };

    return (
        <>
            <Navbar />

            <div className="max-w-4xl mx-auto p-6 mt-6 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold text-[#003366] mb-4">Your Cart</h1>

                {loading && <div className="text-gray-500">Loading cart...</div>}
                {error && <div className="text-red-500">{error}</div>}

                {!loading && !error && cartItems.length === 0 && (
                    <div className="text-gray-600">Your cart is empty.</div>
                )}

                {!loading && !error && cartItems.length > 0 && (
                    cartItems.map((item) => (
                        <div
                            key={item.property._id}
                            onClick={() => handleCardClick(item.property)}
                            className="relative border rounded-lg p-4 mb-4 bg-gray-50 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition"
                        >
                            {/* --- Display the property image --- */}
                            <div className="flex items-center gap-4">
                                {item.property.images && item.property.images.length > 0 ? (
                                    <img
                                        // Now using the imported API_URL
                                        src={`${API_URL}/${item.property.images[0]}`}
                                        alt={item.property.title}
                                        className="w-24 h-24 object-cover rounded-lg shadow-sm"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs text-center p-2">
                                        No Image
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-xl font-semibold text-[#002B5B] mb-1">{item.property.title}</h2>
                                    <p className="text-sm text-gray-600 mb-1">{item.property.location}</p>
                                    <p className="text-sm text-gray-800">Rs. {item.property.price}</p>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(item.property._id);
                                }}
                                className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors"
                                aria-label="Remove from cart"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}