// src/properties/PropertyCard.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, ChevronLeft, ChevronRight, Bed, Bath } from 'lucide-react';
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
            className={`p-2 rounded-full shadow-md transition-colors ${isWishlisted ? 'bg-state-error text-white' : 'bg-white text-gray-400 hover:text-state-error'
                }`}
        >
            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
    );
};


const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-gray-100">
                <h3 className="text-xl font-bold mb-6 text-text-main">{message}</h3>
                <div className="flex justify-center gap-4">
                    <button onClick={onConfirm} className="bg-state-error text-white font-bold py-2.5 px-6 rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-200">Yes, Delete</button>
                    <button onClick={onCancel} className="bg-gray-200 text-text-main font-bold py-2.5 px-6 rounded-xl hover:bg-gray-300 transition">Cancel</button>
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
        return <div className="bg-red-50 text-state-error p-4 rounded-xl shadow border border-red-100">Invalid asset data.</div>;
    }

    // Check if current user is the owner
    const isOwner = currentUserId && property.landlord?._id === currentUserId;

    const mediaUrls = property.images?.map(img => ({ type: 'image', url: `${API_BASE_URL}/${img}` }))
        .concat(property.videos?.map(vid => ({ type: 'video', url: `${API_BASE_URL}/${vid}` }))) || [{ type: 'image', url: 'https://placehold.co/300x200?text=No+Media' }];

    const handleCardClick = () => {
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
        <div
            className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer h-[420px] w-full flex flex-col border border-gray-100"
            onClick={handleCardClick}
        >
            {/* Image Container - Takes up more vertical space now */}
            <div className="relative h-[65%] overflow-hidden">
                <div ref={mediaGalleryRef} className="w-full h-full overflow-x-auto scroll-smooth flex snap-x snap-mandatory scrollbar-hide">
                    {mediaUrls.map((media, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 snap-center relative">
                            {media.type === 'video' ? (
                                <video src={media.url} controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={media.url} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            )}
                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>
                        </div>
                    ))}
                </div>

                {/* Overlaid Title & Price */}
                <div className="absolute bottom-4 left-4 right-4 text-white z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between items-end">
                        <div className="flex-1 pr-2">
                            <h3 className="text-xl font-bold font-heading leading-tight mb-1 text-white drop-shadow-md">{property.title}</h3>
                            <p className="text-gray-300 text-sm flex items-center truncate">
                                <MapPin size={14} className="mr-1 flex-shrink-0 text-secondary" />
                                {property.location}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-secondary drop-shadow-md">
                                Rs. {(property.price / 1000).toFixed(1)}k
                            </div>
                            <span className="text-xs text-gray-300 font-medium">/month</span>
                        </div>
                    </div>
                </div>
                {mediaUrls.length > 1 && (
                    <>
                        <button onClick={prevMedia} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full p-2 text-white z-20 opacity-0 group-hover:opacity-100 transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextMedia} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full p-2 text-white z-20 opacity-0 group-hover:opacity-100 transition-all">
                            <ChevronRight size={20} />
                        </button>
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold py-1 px-3 rounded-full z-20 border border-white/20">
                            {currentMediaIndex + 1}/{mediaUrls.length}
                        </div>
                    </>
                )}

                <div className="absolute top-4 right-4 z-30">
                    <HeartIconComponent propertyId={property._id} />
                </div>
            </div>

            {/* Bottom Details Section */}
            <div className="p-5 bg-white flex flex-col justify-between flex-grow relative">

                {/* Features Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 group/icon">
                            <div className="p-2 rounded-full bg-blue-50 text-blue-500 group-hover/icon:bg-blue-500 group-hover/icon:text-white transition-colors">
                                <Bed size={16} />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{property.bedrooms} <span className="text-gray-400 font-normal hidden sm:inline">Beds</span></span>
                        </div>
                        <div className="flex items-center gap-2 group/icon">
                            <div className="p-2 rounded-full bg-teal-50 text-teal-500 group-hover/icon:bg-teal-500 group-hover/icon:text-white transition-colors">
                                <Bath size={16} />
                            </div>
                            <span className="text-sm font-bold text-gray-700">{property.bathrooms} <span className="text-gray-400 font-normal hidden sm:inline">Baths</span></span>
                        </div>
                    </div>
                </div>

                {/* View Details Button (Appears on Hover) */}
                <div className="w-full">
                    <button className="w-full py-3 rounded-xl bg-gray-50 text-gray-800 font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                        View Details <ChevronRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                </div>
            </div>

            {/* CRITICAL: The buttons below will only render if 'isOwner' is true. */}
            {isOwner && (
                <div className="grid grid-cols-2 gap-3 p-4 border-t bg-gray-50/50">
                    <button onClick={handleUpdateClick} className="bg-white border border-gray-200 text-primary rounded-xl py-2.5 hover:bg-primary hover:text-white font-bold transition-all shadow-sm text-sm">Update</button>
                    <button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="bg-white border border-gray-200 text-state-error rounded-xl py-2.5 hover:bg-state-error hover:text-white font-bold transition-all shadow-sm text-sm disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            )}

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                message="Are you sure you want to delete this asset?"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    );
}