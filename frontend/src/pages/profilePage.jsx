// src/pages/ProfilePage.test.jsx.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider.jsx";
import { toast } from "react-toastify";
import {
    User, Camera, Edit, Heart, MessageCircle, Settings, Clock, Home as HomeIcon, BellDot, Trash2,
    LayoutDashboard, CalendarDays
} from "lucide-react";

import Header from "../layouts/Navbar"; // Assuming Navbar is now Header as per the code

import { useUploadProfilePicture } from "../hooks/useAuthHooks";
// Ensure these imports are from the correct place
import { getCartService, removeFromCartService } from '../services/cartService.js';
import { API_URL } from '../api/api.js';

import UpdatePersonalInfoForm from '../components/profile/UpdatePersonalInfoForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';

import { getMyChats } from '../api/chatApi';
import ChatView from '../components/ChatView';

// Import booking API services and react-query hooks
import { useQuery } from '@tanstack/react-query';
import { getTenantBookingsApi, getLandlordBookingsApi } from '../api/calendarApi';


export default function ProfilePage() {
    const { user, loading: authLoading, setUser, isAuthenticated } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState("overview");
    const [userData, setUserData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        profileImage: "/placeholder-profile.png", // Default placeholder
        joinDate: "N/A",
        role: "User",
    });

    const [savedPropertiesCount, setSavedPropertiesCount] = useState(0);
    const [savedPropertiesList, setSavedPropertiesList] = useState([]);
    const [loadingSavedProperties, setLoadingSavedProperties] = useState(false);
    const [errorSavedProperties, setErrorSavedProperties] = useState(null);

    const [activeApplicationsCount, setActiveApplicationsCount] = useState(0);
    const [pastRentalsCount, setPastRentalsCount] = useState(0);

    const [myChats, setMyChats] = useState([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [errorChats, setErrorChats] = useState(null);
    const [selectedChatId, setSelectedChatId] = useState(null);


    const fileInputRef = useRef(null);
    const { mutate: uploadPicture, isLoading: isUploading } = useUploadProfilePicture();

    // Fetch booking data using react-query
    const { data: bookings, isLoading: isLoadingBookings, isError: isErrorBookings, error: bookingsError } = useQuery({
        queryKey: ['bookings', user?.role],
        queryFn: async () => {
            if (!isAuthenticated) return [];
            if (user.role === 'Tenant') {
                return await getTenantBookingsApi();
            } else if (user.role === 'Landlord') {
                return await getLandlordBookingsApi();
            }
            return [];
        },
        enabled: isAuthenticated && !authLoading && activeTab === "overview" && !!user?.role,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    // Process booking data into counts
    useEffect(() => {
        if (bookings) {
            const now = new Date();
            let activeCount = 0;
            let pastCount = 0;

            bookings.forEach(booking => {
                // Ensure booking.date is treated as a date at the start of the day for comparison
                const bookingDate = new Date(booking.date);
                bookingDate.setHours(0, 0, 0, 0); // Set to start of the day

                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set today to start of the day

                const isFutureBooking = bookingDate >= today;

                if (booking.status === 'pending' || booking.status === 'confirmed') {
                    if (isFutureBooking) {
                        activeCount++;
                    } else {
                        pastCount++; // Treat confirmed/pending past dates as past rentals
                    }
                } else if (booking.status === 'cancelled' || booking.status === 'rejected') {
                    pastCount++;
                }
            });

            setActiveApplicationsCount(activeCount);
            setPastRentalsCount(pastCount);
        }
    }, [bookings]);

    useEffect(() => {
        if (user) {
            setUserData(prevData => ({
                ...prevData,
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                // Use URL constructor for profile image for robustness
                profileImage: user.profilePicture
                    ? new URL(user.profilePicture, API_URL).href
                    : "/placeholder-profile.png",
                joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
                role: user.role || "User",
            }));
        }
    }, [user]);

    // Fetch saved properties count for overview
    useEffect(() => {
        if (activeTab === "overview" && user) {
            fetchSavedPropertiesCount();
        }
    }, [activeTab, user]);

    // Fetch detailed saved properties list when 'saved' tab is active
    useEffect(() => {
        if (activeTab === "saved" && user) {
            fetchDetailedSavedProperties();
        }
    }, [activeTab, user]);

    // Fetch chats only when messages tab is active
    useEffect(() => {
        if (activeTab === "messages" && user) {
            fetchMyChats();
        }
    }, [activeTab, user]);


    const fetchSavedPropertiesCount = async () => {
        setLoadingSavedProperties(true);
        setErrorSavedProperties(null);
        try {
            const res = await getCartService();
            const validItems = res.data?.items?.filter(item => item && item.property) || [];
            setSavedPropertiesCount(validItems.length);
        } catch (err) {
            setErrorSavedProperties("Failed to load saved properties count.");
            console.error(err);
        } finally {
            setLoadingSavedProperties(false);
        }
    };

    const fetchDetailedSavedProperties = async () => {
        setLoadingSavedProperties(true);
        setErrorSavedProperties(null);
        try {
            const res = await getCartService();
            const validItems = res.data?.items?.filter(item => item && item.property) || [];
            setSavedPropertiesList(validItems); // Set the actual list here
        } catch (err) {
            setErrorSavedProperties("Failed to load saved properties.");
            toast.error("Error fetching saved properties.");
            console.error(err);
        } finally {
            setLoadingSavedProperties(false);
        }
    };


    const fetchMyChats = async () => {
        setLoadingChats(true);
        setErrorChats(null);
        try {
            const chats = await getMyChats();
            setMyChats(chats);
            if (chats.length > 0 && !selectedChatId) {
                setSelectedChatId(chats[0]._id);
            }
        } catch (err) {
            setErrorChats("Failed to load chats.");
            toast.error("Error fetching chats.");
            console.error(err);
        } finally {
            setLoadingChats(false);
        }
    };


    const handleImageClick = () => {
        if (!user) {
            toast.info("Please log in to update your profile picture.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Only image files are allowed.");
            event.target.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size cannot exceed 5MB.");
            event.target.value = '';
            return;
        }

        uploadPicture(file, {
            onSuccess: (response) => {
                if (response.success && response.user) {
                    setUser(response.user);
                    toast.success(response.message);
                } else {
                    toast.error(response.message || "Profile picture upload successful, but user data not updated.");
                }
            },
            onError: (err) => {
                console.error("Error uploading profile picture:", err);
                toast.error(err.response?.data?.message || err.message || "An error occurred during upload.");
            },
            onSettled: () => {
                event.target.value = '';
            }
        });
    };

    const handleRemoveSavedProperty = async (propertyId) => {
        try {
            await removeFromCartService(propertyId);
            setSavedPropertiesList(prev => prev.filter(item => item.property._id !== propertyId)); // Update the list
            setSavedPropertiesCount(prev => prev - 1); // Update the count
            toast.success("Asset removed from saved list!");
        } catch (err) {
            toast.error("Failed to remove property from saved list.");
            console.error(err);
        }
    };

    const getSidebarButtonClasses = (tabName) => {
        const baseClasses = "w-full flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200";
        if (activeTab === tabName) {
            return `${baseClasses} bg-[#003366] text-white shadow-md`;
        }
        return `${baseClasses} text-gray-700 hover:bg-blue-100 hover:text-[#003366] hover:shadow-sm`;
    };

    // Adjusted loading state for a smoother UX
    if (authLoading || (loadingSavedProperties && activeTab === "saved") || (isLoadingBookings && activeTab === "overview") || (loadingChats && activeTab === "messages")) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    Loading profile data...
                </div>
            </div>
        );
    }


    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
                <p className="text-xl text-gray-700 mb-4">Please log in to view your profile.</p>
                <Link to="/login" className="bg-[#003366] text-white px-6 py-3 rounded-lg hover:bg-[#002244] transition-colors shadow-md">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />

            <div className="container mx-auto px-4 py-8 flex-grow mt-[70px] md:mt-[90px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-24">
                        {/* Profile Image & Details Section */}
                        <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200 mb-6">
                            <div className="relative group">
                                <img
                                    src={userData.profileImage}
                                    alt={`${userData.fullName}'s Profile`}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-[#003366] shadow-md transition-all duration-300 group-hover:scale-105"
                                />
                                <label
                                    htmlFor="profileUpload"
                                    className="absolute bottom-1 right-1 bg-[#003366] p-2 rounded-full cursor-pointer text-white flex items-center justify-center
                                               opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110"
                                    title="Change profile picture"
                                    onClick={handleImageClick}
                                >
                                    <Camera className="h-5 w-5" />
                                    <input
                                        type="file"
                                        id="profileUpload"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        disabled={isUploading}
                                    />
                                </label>
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                        <span className="animate-spin h-6 w-6 border-4 border-t-transparent border-white rounded-full"></span>
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mt-4 capitalize">
                                {userData.fullName}
                            </h2>
                            <p className="text-base text-gray-600 font-medium">{userData.email}</p>

                            <div className="mt-3 text-sm text-gray-700 space-y-1">
                                <p className="flex items-center justify-center gap-2">
                                    <HomeIcon className="h-4 w-4 text-gray-500" />
                                    <strong>Role:</strong> <span className="capitalize">{userData.role}</span>
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-gray-500" />
                                    <strong>Phone:</strong> {userData.phoneNumber || 'N/A'}
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <strong>Member since:</strong> {userData.joinDate}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Section */}
                        <nav className="space-y-2">
                            <button
                                type="button"
                                className={getSidebarButtonClasses("overview")}
                                onClick={() => setActiveTab("overview")}
                                aria-current={activeTab === "overview" ? "page" : undefined}
                            >
                                <LayoutDashboard className="h-5 w-5 mr-3" />
                                Overview
                            </button>
                            <button
                                type="button"
                                className={getSidebarButtonClasses("personal")}
                                onClick={() => setActiveTab("personal")}
                                aria-current={activeTab === "personal" ? "page" : undefined}
                            >
                                <Edit className="h-5 w-5 mr-3" />
                                Personal Info
                            </button>
                            <button
                                type="button"
                                className={getSidebarButtonClasses("saved")}
                                onClick={() => setActiveTab("saved")}
                                aria-current={activeTab === "saved" ? "page" : undefined}
                            >
                                <Heart className="h-5 w-5 mr-3" />
                                Saved Properties
                            </button>
                            <button
                                type="button"
                                className={getSidebarButtonClasses("messages")}
                                onClick={() => setActiveTab("messages")}
                                aria-current={activeTab === "messages" ? "page" : undefined}
                            >
                                <MessageCircle className="h-5 w-5 mr-3" />
                                Messages
                            </button>

                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3 bg-white rounded-xl shadow-lg p-8">
                        {activeTab === "overview" && (
                            <>
                                <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Overview</h1>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
                                    {/* Saved Properties Card */}
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center">
                                        <Heart className="h-10 w-10 text-[#003366] mb-3" />
                                        <div className="text-3xl font-bold text-gray-900">
                                            {loadingSavedProperties ? <span className="animate-pulse">...</span> : savedPropertiesCount}
                                        </div>
                                        <p className="text-lg text-gray-600">Saved Properties</p>
                                    </div>

                                    {/* Active Applications Card */}
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center">
                                        <CalendarDays className="h-10 w-10 text-[#003366] mb-3" />
                                        <div className="text-3xl font-bold text-gray-900">
                                            {isLoadingBookings ? <span className="animate-pulse">...</span> : activeApplicationsCount}
                                        </div>
                                        <p className="text-lg text-gray-600">Active Applications</p>
                                    </div>

                                    {/* Past Rentals Card */}
                                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col items-center justify-center">
                                        <HomeIcon className="h-10 w-10 text-[#003366] mb-3" />
                                        <div className="text-3xl font-bold text-gray-900">
                                            {isLoadingBookings ? <span className="animate-pulse">...</span> : pastRentalsCount}
                                        </div>
                                        <p className="text-lg text-gray-600">Past Rentals</p>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                                <div className="space-y-4">
                                    {/* Placeholder for Recent Activity - You'll replace this with dynamic data */}
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                                        <span className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                                        <div>
                                            <p className="text-gray-800 font-medium">Application approved for Luxury Beachfront Condo</p>
                                            <p className="text-sm text-gray-500">2 days ago</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                                        <div>
                                            <p className="text-gray-800 font-medium">Saved Modern Downtown Loft</p>
                                            <p className="text-sm text-gray-500">5 days ago</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center">
                                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></span>
                                        <div>
                                            <p className="text-gray-800 font-medium">Application submitted for Modern Downtown Loft</p>
                                            <p className="text-sm text-gray-500">1 week ago</p>
                                        </div>
                                    </div>
                                    {/* End of Placeholder */}
                                </div>
                            </>
                        )}

                        {activeTab === "personal" && (
                            <div className="space-y-8">
                                <UpdatePersonalInfoForm />
                                <ChangePasswordForm />
                            </div>
                        )}

                        {activeTab === "saved" && (
                            <>
                                <h1 className="text-3xl font-bold text-gray-800 mb-6">Saved Properties ({savedPropertiesList.length})</h1>
                                {loadingSavedProperties && <div className="text-gray-500">Loading saved properties...</div>}
                                {errorSavedProperties && <div className="text-red-500">{errorSavedProperties}</div>}

                                {!loadingSavedProperties && !errorSavedProperties && savedPropertiesList.length === 0 && (
                                    <div className="text-gray-600 text-center py-10">
                                        You haven't saved any properties yet.
                                    </div>
                                )}

                                {!loadingSavedProperties && !errorSavedProperties && savedPropertiesList.length > 0 && (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {savedPropertiesList.map((item) => (
                                            <div
                                                key={item.property._id}
                                                // Consider making this clickable to property detail page
                                                className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                                            >
                                                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded-md mb-3 overflow-hidden">
                                                    {item.property.images && item.property.images.length > 0 ? (
                                                        <img
                                                            // ⭐ FIX APPLIED HERE for saved property images ⭐
                                                            // Using URL constructor for robust path generation
                                                            src={new URL(item.property.images[0], API_URL).href}
                                                            alt={item.property.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-2">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                <h2 className="text-xl font-semibold text-gray-900">{item.property.title}</h2>
                                                <p className="text-sm text-gray-500 flex items-center mt-1"><HomeIcon className="h-4 w-4 mr-1" />📍 {item.property.location}</p>
                                                <p className="text-xl text-[#003366] font-bold mt-2">Rs. {item.property.price}</p>
                                                <div className="flex justify-between items-center mt-4">
                                                    <Link
                                                        to={`/property/${item.property._id}`}
                                                        className="bg-[#003366] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#002244] transition-colors shadow-sm"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveSavedProperty(item.property._id);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 transition-colors text-xl"
                                                        title="Remove from saved"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "applications" && (
                            // Placeholder for Applications tab content (you can expand this later)
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Applications (Placeholder)</h2>
                        )}

                        {activeTab === "messages" && (
                            <div className="flex h-[70vh] rounded-lg overflow-hidden border border-gray-200">
                                {/* Left Pane: Chat List */}
                                <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">My Chats</h2>
                                    {loadingChats && <div className="text-gray-500 text-center py-4">Loading chats...</div>}
                                    {errorChats && <div className="text-red-500 text-center py-4">{errorChats}</div>}

                                    {!loadingChats && !errorChats && myChats.length === 0 && (
                                        <div className="text-gray-600 text-center py-4">
                                            You have no ongoing chats.
                                        </div>
                                    )}

                                    {!loadingChats && !errorChats && myChats.length > 0 && (
                                        <div className="flex-1 overflow-y-auto pr-2">
                                            {myChats.map(chat => {
                                                const otherParticipant = chat.participants.find(p => p._id !== user._id);
                                                const chatDisplayName = otherParticipant ? otherParticipant.fullName : chat.name || 'Unknown User';

                                                return (
                                                    <div
                                                        key={chat._id}
                                                        onClick={() => setSelectedChatId(chat._id)}
                                                        className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors duration-200
                                                            ${selectedChatId === chat._id ? 'bg-[#003366] text-white shadow-md' : 'bg-white hover:bg-blue-50'}`}
                                                    >
                                                        <h4 className="font-semibold text-lg">{chatDisplayName}</h4>
                                                        <p className={`text-sm mt-1 ${selectedChatId === chat._id ? 'text-blue-100' : 'text-gray-600'} truncate`}>
                                                            {chat.lastMessage || 'No messages yet.'}
                                                        </p>
                                                        {chat.lastMessageAt && (
                                                            <p className={`text-xs mt-1 ${selectedChatId === chat._id ? 'text-blue-200' : 'text-gray-500'}`}>
                                                                {new Date(chat.lastMessageAt).toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Right Pane: Chat View Component */}
                                <div className="w-2/3 p-4 flex flex-col">
                                    {selectedChatId ? (
                                        <ChatView selectedChatId={selectedChatId} currentUserId={user._id} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <MessageCircle size={64} className="mb-4 text-gray-400" />
                                            <p className="text-lg">Select a chat from the left to view messages.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "notifications" && (
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Notifications (Placeholder)</h2>
                            // Add notification display logic here
                        )}

                        {activeTab === "settings" && (
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings (Placeholder)</h2>
                            // Add general settings options here
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
}