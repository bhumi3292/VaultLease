import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getOnePropertyApi } from '../api/propertyApi';
import { addToCartApi, removeFromCartApi, getCartApi } from '../api/cartApi';
import { createBookingApi } from '../api/bookingApi';
import { FaHeart, FaUniversity, FaBuilding } from 'react-icons/fa';
import { FiHeart, FiShare2 } from 'react-icons/fi';
import { AuthContext } from '../auth/AuthProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

import { MapPin, Maximize2, Phone, Mail, DollarSign, User, ChevronLeft, ChevronRight, CreditCard, Calendar as CalendarIcon, MessageSquare, Box, Layers, Info } from 'lucide-react';

import { useKhaltiPayment } from '../hooks/payment/useKhaltiPayment.js';



import { getFullMediaUrl } from '../utils/mediaUrlHelper.js';
import PaymentSelectionModal from "../components/payment/PaymentSelectionModal.jsx";
import { createOrGetChat } from '../api/chatApi';


const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text).then(() => toast.success(message)).catch(() => toast.error('Failed to copy.'));
};

export default function PropertyDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentModel, setPaymentModel] = useState(false);

    const { isAuthenticated, user, loading: isLoadingAuth } = useContext(AuthContext);

    const [property, setProperty] = useState(location.state?.property || null);
    const [loading, setLoading] = useState(!property);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);

    // Use the Khalti payment hook
    // Use the Khalti payment hook
    const { initiateKhaltiPayment, isProcessingPayment } = useKhaltiPayment(
        property?._id,
        property?.title,
        property?.price
    );

    const [currentMediaIndex, setCurrentMediaIndex] = useState(location.state?.initialMediaIndex || 0);

    // Use the getFullMediaUrl helper for media paths
    const allMedia = useMemo(() => {
        if (!property) return [];
        return [
            ...(property.images || []).map(img => getFullMediaUrl(img)),
            ...(property.videos || []).map(vid => getFullMediaUrl(vid))
        ];
    }, [property]);

    // Fetch property details if not already passed via location state
    useEffect(() => {
        if (!property && id) {
            getOnePropertyApi(id).then(res => {
                setProperty(res.data.data);
                setLoading(false);
                setCurrentMediaIndex(0); // Reset media index on new property load
            }).catch(() => {
                setError('Failed to load asset details.');
                setLoading(false);
            });
        }
    }, [id, property]);

    // Check if property is liked by the current user
    useEffect(() => {
        if (isAuthenticated && property?._id) {
            getCartApi().then(res => {
                const likedIds = res.data.data?.items?.map(i => i.property?._id);
                setLiked(likedIds?.includes(property._id));
            }).catch(err => {
                console.error("Failed to fetch wishlist for like check:", err);
                setLiked(false);
            });
        } else {
            setLiked(false);
        }
    }, [property, isAuthenticated]);

    // Toggle property like status (add/remove from cart)
    const handleToggleLike = () => {
        if (!isAuthenticated) return toast.warn('Login to add to your wishlist.');
        if (!property?._id) return toast.error('Invalid asset ID.');

        const action = liked ? removeFromCartApi : addToCartApi;
        action(property._id).then(() => {
            setLiked(!liked);
            toast.success(liked ? 'Removed from your wishlist.' : 'Added to your wishlist.');
        }).catch(err => toast.error(err.response?.data?.message || 'Action failed.'));
    };

    // Open Gmail compose window
    const openGmailCompose = (email) => {
        if (email) {
            const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
            window.open(gmailComposeUrl, '_blank');
        } else {
            toast.error('No email address available to compose.');
        }
    };

    const handleEsewaPayment = () => {
        if (!property?.price || property.price <= 0) {
            toast.error("Invalid asset price for payment.");
            return;
        }

        const transaction_uuid = `${Date.now()}-${uuidv4().slice(0, 8)}`; // Unique ID
        const product_code = "EPAYTEST";
        const total_amount = property.price.toFixed(2);
        const signed_field_names = "total_amount,transaction_uuid,product_code";

        const signingString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const secret = "8gBm/:&EnhH.1/q";

        const signature = CryptoJS.HmacSHA256(signingString, secret).toString(CryptoJS.enc.Base64);

        const fields = {
            amount: total_amount,
            tax_amount: "0",
            total_amount: total_amount,
            transaction_uuid: transaction_uuid,
            product_code: product_code,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${window.location.origin}/payment/success?source=esewa`, // Redirect to app
            failure_url: `${window.location.origin}/payment/failure?source=esewa`,
            signed_field_names: signed_field_names,
            signature: signature,
        };

        console.log("eSewa Request Fields:", fields); // Debugging

        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");

        Object.entries(fields).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.setAttribute("type", "hidden");
            input.setAttribute("name", key);
            input.setAttribute("value", value);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    };

    // Handle payment
    const handlePayment = () => {
        setPaymentModel(true);
    };

    const handleChatLandlord = async () => {
        if (!isAuthenticated) {
            toast.warn('Please log in to chat with the department.');
            return;
        }
        if (!displayLandlordId) {
            toast.error('Department contact information is missing.');
            return;
        }
        try {
            const chat = await createOrGetChat(displayLandlordId, property._id);
            navigate('/chat', { state: { preselectChatId: chat._id } });
        } catch (err) {
            toast.error(err.message || 'Failed to start chat.');
        }
    };

    // New handler for WhatsApp chat
    const handleWhatsAppChat = (phoneNumber) => {
        if (!phoneNumber) {
            toast.error('Contact number not available for WhatsApp.');
            return;
        }
        // Basic cleanup for phone number, assuming Nepal context or generic
        const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
        const whatsappUrl = `https://web.whatsapp.com/send?phone=${cleanedPhoneNumber}`;
        window.open(whatsappUrl, '_blank');
    };

    // Check if a URL points to a video file
    const isVideo = url => /\.(mp4|webm|ogg|mov)$/i.test(url);

    // Navigation for media gallery
    const nextMedia = () => {
        setCurrentMediaIndex(prevIndex => Math.min(prevIndex + 1, allMedia.length - 1));
    };

    const prevMedia = () => {
        setCurrentMediaIndex(prevIndex => Math.max(prevIndex - 1, 0));
    };

    const mainMedia = allMedia[currentMediaIndex] || null;

    if (loading || isLoadingAuth) return (
        <div className="flex justify-center items-center h-screen bg-[#F4F8F8]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#008080]"></div>
        </div>
    );
    if (error) return <div className="text-red-500 text-xl p-8 text-center bg-[#F4F8F8] h-screen">{error}</div>;
    if (!property) return <div className="text-gray-600 text-xl p-8 text-center bg-[#F4F8F8] h-screen">Asset not found.</div>;

    // --- MAPPING ALIASES FOR COMPATIBILITY ---
    const displayTitle = property.title || property.roomName || "Untitled Asset";
    const displayDescription = property.description || property.roomDescription || "No detailed specifications provided.";
    const displayPrice = property.price || 0;
    const displayCategory = property.categoryId?.category_name || property.departmentId?.departmentName || property.departmentId?.department_name || "General Asset";
    const displayCapacity = property.bedrooms || property.capacity || "N/A"; // "Quantity"
    const displayFloor = property.bathrooms || property.floorLevel || "N/A"; // "Floor Level"
    const displayLocation = property.location || "Main Campus";
    const displayLandlordName = property.landlord?.fullName || property.manager?.fullName || "University Admin";
    const displayLandlordEmail = property.landlord?.email || property.manager?.email || "admin@university.edu";
    const displayLandlordPhone = property.landlord?.phoneNumber || property.manager?.phoneNumber || "";
    const displayLandlordId = property.landlord?._id || property.manager?._id;
    // ------------------------------------------

    const isOwner = isAuthenticated && (user?.role === 'Landlord' || user?.role === 'Administrator' || user?.role === 'ADMINISTRATOR' || user?.role === 'ADMIN') && (user?._id === displayLandlordId || user?.role === 'ADMIN' || user?.role === 'ADMINISTRATOR');

    // Logic for Out of Stock
    const assetQuantity = Number(property.bedrooms || property.capacity || 0);
    const isOutOfStock = assetQuantity <= 0;

    const handleOpenManageAvailabilityModal = () => {
        if (!isAuthenticated) {
            toast.warn('Please log in using authorized credentials.');
            return;
        }
        if (user?._id !== displayLandlordId && user?.role !== 'ADMIN') {
            toast.error('You do not have permission to manage this asset.');
            return;
        }
        setShowManageAvailabilityModal(true);
    };

    const handleCloseManageAvailabilityModal = () => {
        setShowManageAvailabilityModal(false);
    };

    return (
        <div className="min-h-screen bg-[#F4F8F8] py-10 px-4 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

                    {/* Header Section */}
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white to-gray-50">
                        <div>
                            <div className="flex items-center gap-2 text-[#008080] font-semibold text-sm uppercase tracking-wider mb-2">
                                <FaUniversity /> {displayCategory}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{displayTitle}</h1>
                            <p className="text-gray-500 mt-2 flex items-center gap-1"><MapPin size={16} /> {displayLocation}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => copyToClipboard(window.location.href, 'Link copied to clipboard')} className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 transition-colors">
                                <FiShare2 size={20} />
                            </button>
                            <button onClick={handleToggleLike} className={`p-3 rounded-xl border transition-colors ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-500'}`}>
                                {liked ? <FaHeart size={20} /> : <FiHeart size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Media (8 cols) */}
                        <div className="lg:col-span-8 space-y-4">
                            <div className="bg-gray-100 rounded-2xl flex justify-center items-center aspect-video relative overflow-hidden group">
                                {mainMedia && (isVideo(mainMedia) ? <video src={mainMedia} controls className="w-full h-full object-cover" /> : <img src={mainMedia} alt={displayTitle} className="w-full h-full object-cover" />)}
                                {!mainMedia && <div className="flex flex-col items-center text-gray-400"><Info size={48} /><span className="mt-2">No media available</span></div>}

                                {allMedia.length > 1 && (
                                    <>
                                        <button onClick={prevMedia} disabled={currentMediaIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition disabled:opacity-0">
                                            <ChevronLeft size={24} className="text-gray-800" />
                                        </button>
                                        <button onClick={nextMedia} disabled={currentMediaIndex === allMedia.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition disabled:opacity-0">
                                            <ChevronRight size={24} className="text-gray-800" />
                                        </button>
                                    </>
                                )}
                                {allMedia.length > 0 && (
                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium py-1 px-3 rounded-full">
                                        {currentMediaIndex + 1} / {allMedia.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {allMedia.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto py-2 pb-4 scrollbar-hide">
                                    {allMedia.map((mediaUrl, i) => (
                                        <div key={i} onClick={() => setCurrentMediaIndex(i)} className={`relative flex-shrink-0 w-24 h-24 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${currentMediaIndex === i ? 'border-[#008080]' : 'border-transparent hover:border-gray-300'}`}>
                                            {isVideo(mediaUrl) ? (
                                                <video src={mediaUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={mediaUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Specifications */}
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Layers className="text-[#008080]" /> Asset Specifications</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Category</p>
                                        <p className="font-semibold text-gray-800 flex items-center gap-2 mt-1"><FaBuilding className="text-[#008080]" /> {displayCategory}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Location</p>
                                        <p className="font-semibold text-gray-800 flex items-center gap-2 mt-1"><MapPin size={18} className="text-[#008080]" /> {displayLocation}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Lease Cost</p>
                                        <p className="font-semibold text-gray-800 flex items-center gap-2 mt-1"><DollarSign size={18} className="text-[#008080]" /> Rs. {displayPrice.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Quantity / Capacity</p>
                                        <p className="font-semibold text-gray-800 flex items-center gap-2 mt-1"><Box size={18} className="text-[#008080]" /> {displayCapacity} Units</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Floor Level</p>
                                        <p className="font-semibold text-gray-800 flex items-center gap-2 mt-1"><Maximize2 size={18} className="text-[#008080]" /> Level {displayFloor}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-gray-500 text-xs uppercase tracking-wide">Date Listed</p>
                                        <p className="font-semibold text-gray-800 flex items-center gap-2 mt-1"><CalendarIcon size={18} className="text-[#008080]" /> {new Date(property.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Description & Usage Policy</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{displayDescription}</p>
                            </div>
                        </div>

                        {/* Right Column: Actions (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Action Card */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-6">
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <h3 className={`text-2xl font-bold ${isOutOfStock ? 'text-red-500' : 'text-[#008080]'}`}>
                                        {isOutOfStock ? 'Out of Stock' : 'Available for Lease'}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Department Contact</h3>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-[#008080]/10 rounded-full flex items-center justify-center text-[#008080]">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{displayLandlordName}</p>
                                            <p className="text-xs text-gray-500">Administrator</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => openGmailCompose(displayLandlordEmail)} className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#008080]/30 transition-all group">
                                            <Mail size={20} className="text-gray-500 group-hover:text-[#008080] mb-1" />
                                            <span className="text-xs font-medium text-gray-600">Email</span>
                                        </button>
                                        <button onClick={displayLandlordPhone ? () => handleWhatsAppChat(displayLandlordPhone) : null} disabled={!displayLandlordPhone} className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#008080]/30 transition-all group disabled:opacity-50">
                                            <Phone size={20} className="text-gray-500 group-hover:text-[#008080] mb-1" />
                                            <span className="text-xs font-medium text-gray-600">WhatsApp</span>
                                        </button>
                                    </div>

                                    {displayLandlordId && (
                                        <button onClick={handleChatLandlord} className="w-full py-3 bg-white border border-[#008080] text-[#008080] rounded-xl hover:bg-[#008080]/5 font-semibold transition-colors flex items-center justify-center gap-2">
                                            <MessageSquare size={18} /> In-App Chat
                                        </button>
                                    )}

                                    <div className="h-px bg-gray-100 my-4"></div>

                                    {/* Primary Action Buttons */}
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessingPayment || isOutOfStock}
                                        className={`w-full py-4 text-lg ${isOutOfStock ? 'bg-yellow-500 hover:bg-yellow-600 text-white cursor-not-allowed' : 'bg-[#008080] hover:bg-[#005F5F] text-white'} rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 ${isProcessingPayment ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {isOutOfStock ? (
                                            'Out of Stock'
                                        ) : (
                                            <>
                                                <CreditCard size={24} />
                                                {isProcessingPayment ? 'Processing...' : 'Book / Lease Asset'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-8 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} VaultLease University Asset Management.</p>
                </footer>
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />

            {/* Booking Modal Component Removed */}

            {/* LandlordManageAvailabilityModal Component Removed */}

            {paymentModel && (
                <PaymentSelectionModal
                    show={paymentModel}
                    onClose={() => setPaymentModel(false)}
                    onSelectPaymentMethod={(method) => {
                        if (method === 'khalti') {
                            initiateKhaltiPayment();
                        } else if (method === 'esewa') {
                            handleEsewaPayment();
                        } else if (method === 'pay_later') {
                            // Handle Pay Later / Free Booking
                            createBookingApi({ property: property._id })
                                .then(() => {
                                    toast.success("Asset reserved successfully! Please complete any required formalities at the University Administration.");
                                    setPaymentModel(false);
                                    // Refresh property to update quantity
                                    getOnePropertyApi(id).then(res => setProperty(res.data.data));
                                })
                                .catch(err => {
                                    toast.error(err.response?.data?.message || "Booking failed.");
                                });
                        }
                    }}
                />
            )}

        </div>
    );
}