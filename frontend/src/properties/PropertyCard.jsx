// src/properties/PropertyCard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { addToCartApi, removeFromCartApi, getCartApi } from '../api/cartApi';
import { toast } from "react-toastify";
import { VITE_API_BASE_URL } from '../utils/env';

const API_BASE_URL = VITE_API_BASE_URL || "http://localhost:3001";

const HeartIconComponent = ({ propertyId }) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchCart = useCallback(async () => {
        try {
            const response = await getCartApi();
            if (response.data && Array.isArray(response.data.data)) {

                const wishlisted = response.data.data.some(item => item._id === propertyId);
                setIsWishlisted(wishlisted);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleHeartClick = async (e) => {
        e.stopPropagation();
        if (loading) return;

        try {
            if (isWishlisted) {
                await removeFromCartApi(propertyId);
                setIsWishlisted(false);
                toast.success("Removed from wishlist!");
            } else {
                await addToCartApi(propertyId);
                setIsWishlisted(true);
                toast.success("Added to wishlist!");
            }
        } catch (error) {
            console.error("Failed to update cart:", error);
            toast.error(error.response?.data?.message || "Failed to update wishlist.");
        }
    };

    return (
        <button
            onClick={handleHeartClick}
            disabled={loading}
            className={`p-2 rounded-full shadow-md transition-colors ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
                }`}
        >
            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
    );
};


const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
                <h3 className="text-lg font-semibold mb-4">{message}</h3>
                <div className="flex justify-center space-x-4">
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Yes, Delete</button>
                    <button onClick={onCancel} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default function PropertyCard({ property, currentUserId, onUpdate, onDelete, isDeleting }) {
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const mediaGalleryRef = useRef(null);

    if (!property) {
        return <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow">Invalid property data.</div>;
    }

    // Map backend fields to frontend props if necessary
    const title = property.title || property.roomName;
    const description = property.description || property.roomDescription;
    const landlord = property.landlord || property.manager;

    // --- DEBUGGING LOGS (Safe Access) ---
    // console.log(`Property: ${title} (ID: ${property._id})`);
    // console.log(`  Landlord ID: ${landlord?._id}`);
    // console.log(`  Current User ID: ${currentUserId}`);
    // console.log(`  Is Owner? ${currentUserId && landlord?._id === currentUserId}`);
    // console.log("-----------------------------------------");
    // --- END DEBUGGING LOGS ---

    // The logic to determine if the current user owns this property
    const isOwner = currentUserId && landlord?._id === currentUserId;

    // --- COMBINE IMAGES AND VIDEOS FOR CAROUSEL ---
    const mediaUrls = property.images?.map(img => ({ type: 'image', url: `${API_BASE_URL}/${img}` }))
        .concat(property.videos?.map(vid => ({ type: 'video', url: `${API_BASE_URL}/${vid}` }))) || [{ type: 'image', url: 'https://placehold.co/300x200?text=No+Media' }];

    // --- MODIFIED handleCardClick ---
    const handleCardClick = () => {
        // Pass the current property and the currently visible media index to the detail page
        navigate(`/property/${property._id}`, {
            state: {
                property: property,
                initialMediaIndex: currentMediaIndex,
            },
        });
    };

    const handleUpdateClick = (e) => {
        e.stopPropagation();
        if (onUpdate) onUpdate(property);
    };
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(false);
        if (onDelete) {
            onDelete(property._id);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const nextMedia = (e) => {
        e.stopPropagation();
        setCurrentMediaIndex((prevIndex) => Math.min(prevIndex + 1, mediaUrls.length - 1));
        if (mediaGalleryRef.current) {
            mediaGalleryRef.current.scrollLeft += mediaGalleryRef.current.offsetWidth;
        }
    };

    const prevMedia = (e) => {
        e.stopPropagation();
        setCurrentMediaIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        if (mediaGalleryRef.current) {
            mediaGalleryRef.current.scrollLeft -= mediaGalleryRef.current.offsetWidth;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer relative" onClick={handleCardClick}>
            <div className="relative">
                <div ref={mediaGalleryRef} className="w-full h-48 rounded-t-xl overflow-x-auto scroll-smooth flex snap-x snap-mandatory hide-scrollbar">
                    {mediaUrls.map((media, index) => (
                        <div key={index} className="w-full h-48 flex-shrink-0 snap-start">
                            {media.type === 'video' ? (
                                <video src={media.url} controls className="w-full h-48 object-cover rounded-t-xl" />
                            ) : (
                                <img src={media.url} alt={property.title} className="w-full h-48 object-cover rounded-t-xl" />
                            )}
                        </div>
                    ))}
                </div>
                {mediaUrls.length > 1 && (
                    <>
                        <button onClick={prevMedia} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-90 z-20">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextMedia} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-90 z-20">
                            <ChevronRight size={24} />
                        </button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs py-0.5 px-2 rounded z-20">
                            {currentMediaIndex + 1} / {mediaUrls.length}
                        </div>
                    </>
                )}
                <div className="absolute top-2 right-2 z-30">
                    <HeartIconComponent propertyId={property._id} />
                </div>
            </div>
            <div className="p-4 flex flex-col">
                <h3 className="text-xl font-bold text-[#002B5B] mb-1">{title}</h3>
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <MapPin size={16} className="mr-1" />{property.location}
                </p>
                <p className="text-lg text-gray-900 font-semibold">
                    Rs. {property.price} <span className="text-sm text-gray-600">/ month</span>
                </p>
                <p className="text-sm text-gray-600 my-2 line-clamp-3">{description}</p>
                <div className="text-sm text-gray-600 mt-auto">
                    {property.bedrooms} Beds • {property.bathrooms} Baths
                </div>
            </div>
            {/* CRITICAL: The buttons below will only render if 'isOwner' is true.
                This depends entirely on 'currentUserId' matching 'property.landlord._id'.
            */}
            {isOwner && (
                <div className="flex space-x-2 p-4 border-t bg-gray-50">
                    <button onClick={handleUpdateClick} className="flex-1 bg-blue-900 text-white rounded-lg py-2 hover:bg-blue-950">Update</button>
                    <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="flex-1 bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                message="Are you sure you want to delete this property?"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}