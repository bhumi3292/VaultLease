import React, { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider.jsx";
import { toast } from "react-toastify";
import {
    User, Camera, Edit, Heart, MessageCircle, Settings, Clock, Home as HomeIcon, BellDot, Trash2,
    LayoutDashboard, CalendarDays, GraduationCap, Building, LogOut, ChevronRight
} from "lucide-react";

import Navbar from "../layouts/navbar.jsx"; // Renamed to Navbar for clarity

import { useUploadProfilePicture } from "../hooks/useAuthHooks";
import { getCartService, removeFromCartService } from '../services/cartService.js';
import { API_URL } from '../api/api.js';

import UpdatePersonalInfoForm from '../components/profile/UpdatePersonalInfoForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';

import { getMyChats } from '../api/chatApi';
import ChatView from '../components/ChatView';

import { useQuery } from '@tanstack/react-query';
import { getTenantBookingsApi, getLandlordBookingsApi } from '../api/calendarApi';


export default function ProfilePage() {
    const { user, loading: authLoading, setUser, isAuthenticated, logout } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState("overview");
    const [userData, setUserData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        profileImage: "/placeholder-profile.png",
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
    // Renamed loading state property to 'isLoading' to match standard React Query / Hook naming if needed, 
    // but assuming useUploadProfilePicture returns { mutate, isLoading }
    const { mutate: uploadPicture, isLoading: isUploading } = useUploadProfilePicture();


    // Fetch booking data using react-query
    const { data: bookings, isLoading: isLoadingBookings } = useQuery({
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
            let activeCount = 0;
            let pastCount = 0;

            bookings.forEach(booking => {
                const bookingDate = new Date(booking.date);
                bookingDate.setHours(0, 0, 0, 0);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const isFutureBooking = bookingDate >= today;

                if (booking.status === 'pending' || booking.status === 'confirmed') {
                    if (isFutureBooking) {
                        activeCount++;
                    } else {
                        pastCount++;
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
            setUserData({
                fullName: user.fullName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                profileImage: user.profilePicture
                    ? new URL(user.profilePicture, API_URL).href
                    : "/placeholder-profile.png",
                joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
                role: user.role || "User",
                universityId: user.universityId || "N/A",
                department: user.department || null,
            });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === "overview" && user) {
            fetchSavedPropertiesCount();
        }
    }, [activeTab, user]);

    useEffect(() => {
        if (activeTab === "saved" && user) {
            fetchDetailedSavedProperties();
        }
    }, [activeTab, user]);

    useEffect(() => {
        if (activeTab === "messages" && user) {
            fetchMyChats();
        }
    }, [activeTab, user]);


    const fetchSavedPropertiesCount = async () => {
        setLoadingSavedProperties(true);
        try {
            const res = await getCartService();
            const validItems = res.data?.items?.filter(item => item && item.property) || [];
            setSavedPropertiesCount(validItems.length);
        } catch (err) {
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
            setSavedPropertiesList(validItems);
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
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size cannot exceed 5MB.");
            event.target.value = '';
            return;
        }

        uploadPicture(file, {
            onSuccess: (response) => {
                if (response.success && response.user) {
                    setUser(response.user);
                    localStorage.setItem('user', JSON.stringify(response.user));
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
            setSavedPropertiesList(prev => prev.filter(item => item.property._id !== propertyId));
            setSavedPropertiesCount(prev => prev - 1); // Optimistically update count
            toast.success("Property removed from saved list!");
        } catch (err) {
            toast.error("Failed to remove property from saved list.");
            console.error(err);
        }
    };

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'personal', label: 'Personal Info', icon: Edit },
        { id: 'saved', label: 'Saved Properties', icon: Heart },
        { id: 'messages', label: 'Messages', icon: MessageCircle },
        // { id: 'settings', label: 'Settings', icon: Settings }, // Placeholder
    ];

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008080]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
                    <div className="w-20 h-20 bg-[#008080]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="h-10 w-10 text-[#008080]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                    <p className="text-gray-600 mb-8">Please log in to manage your profile and view your dashbaord.</p>
                    <Link to="/login" className="block w-full bg-[#008080] text-white py-3 rounded-lg hover:bg-[#006666] transition-colors font-semibold shadow-lg shadow-[#008080]/30">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            {/* Top Pattern Background */}
            <div className="bg-[#008080] h-48 w-full absolute top-0 left-0 z-0">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            <div className="container mx-auto px-4 py-8 flex-grow z-10 pt-28">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-[#008080] to-[#006666] relative"></div>
                            <div className="px-6 pb-6 text-center -mt-12">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                                        <img
                                            src={userData.profileImage}
                                            alt={userData.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={handleImageClick}
                                        className="absolute bottom-0 right-0 bg-[#008080] text-white p-2 rounded-full shadow-lg hover:bg-[#006666] transition-colors border-2 border-white"
                                        title="Change Photo"
                                    >
                                        <Camera size={14} />
                                    </button>
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        disabled={isUploading}
                                    />
                                </div>

                                <h2 className="text-xl font-bold text-gray-900 mt-3 capitalize">{userData.fullName}</h2>
                                <p className="text-sm text-gray-500 mb-4">{userData.email}</p>

                                <div className="flex flex-wrap justify-center gap-2 mb-6">
                                    <span className="px-3 py-1 bg-[#008080]/10 text-[#008080] text-xs font-semibold rounded-full capitalize">
                                        {userData.role}
                                    </span>
                                    {userData.universityId && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                            ID: {userData.universityId}
                                        </span>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-4 text-left space-y-3">
                                    {userData.department && (
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Building size={16} className="mr-3 text-[#008080]" />
                                            <span className="truncate">{userData.department}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MessageCircle size={16} className="mr-3 text-[#008080]" />
                                        <span>{userData.phoneNumber || 'No phone added'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock size={16} className="mr-3 text-[#008080]" />
                                        <span>Joined {userData.joinDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
                            <nav className="space-y-1">
                                {sidebarItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                                            ${activeTab === item.id
                                                ? 'bg-[#008080] text-white shadow-md shadow-[#008080]/20'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-[#008080]'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon size={18} className="mr-3" />
                                            {item.label}
                                        </div>
                                        {activeTab === item.id && <ChevronRight size={16} />}
                                    </button>
                                ))}
                            </nav>
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <button className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
                                    <LogOut size={18} className="mr-3" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        {activeTab === "overview" && (
                            <div className="space-y-6">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between group hover:border-[#008080]/30 transition-all">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium">Saved Properties</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                                {loadingSavedProperties ? "..." : savedPropertiesCount}
                                            </h3>
                                        </div>
                                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                            <Heart className="text-red-500" size={24} />
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between group hover:border-[#008080]/30 transition-all">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium">Active Applications</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                                {isLoadingBookings ? "..." : activeApplicationsCount}
                                            </h3>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <CalendarDays className="text-blue-500" size={24} />
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center justify-between group hover:border-[#008080]/30 transition-all">
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium">Past Rentals</p>
                                            <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                                {isLoadingBookings ? "..." : pastRentalsCount}
                                            </h3>
                                        </div>
                                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                            <HomeIcon className="text-green-500" size={24} />
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity Section */}
                                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                                    <div className="space-y-6">
                                        {[1, 2].map((_, i) => (
                                            <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                                <div className="w-10 h-10 rounded-full bg-[#008080]/10 flex items-center justify-center shrink-0">
                                                    <BellDot size={20} className="text-[#008080]" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-800 font-medium">System integration update</p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        Your profile was successfully updated with the latest university credentials.
                                                    </p>
                                                    <p className="text-gray-400 text-xs mt-2">2 hours ago</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "personal" && (
                            <div className="space-y-8">
                                <UpdatePersonalInfoForm />
                                <ChangePasswordForm />
                            </div>
                        )}

                        {activeTab === "saved" && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 min-h-[500px]">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <Heart className="mr-3 text-[#008080] fill-current" /> Saved Properties
                                </h2>

                                {loadingSavedProperties && (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin h-8 w-8 border-2 border-t-transparent border-[#008080] rounded-full"></div>
                                    </div>
                                )}

                                {!loadingSavedProperties && !errorSavedProperties && savedPropertiesList.length === 0 && (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Heart className="text-gray-300" size={40} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">No saved properties</h3>
                                        <p className="text-gray-500 mt-2">Properties you mark as favorite will appear here.</p>
                                        <Link to="/departments" className="inline-block mt-6 px-6 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors text-sm font-medium">
                                            Browse Properties
                                        </Link>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {savedPropertiesList.map((item) => (
                                        <div key={item.property._id} className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white">
                                            <div className="relative h-48 bg-gray-200">
                                                {item.property.images && item.property.images.length > 0 ? (
                                                    <img
                                                        src={new URL(item.property.images[0], API_URL).href}
                                                        alt={item.property.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <span className="text-sm">No Image</span>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSavedProperty(item.property._id);
                                                    }}
                                                    className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 truncate">{item.property.title}</h3>
                                                <p className="text-sm text-gray-500 flex items-center mt-1">
                                                    <HomeIcon size={14} className="mr-1" /> {item.property.location}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-[#008080] font-bold">Rs. {item.property.price}</span>
                                                    <Link to={`/property/${item.property._id}`} className="text-xs font-semibold text-gray-900 hover:text-[#008080] transition-colors">
                                                        View Details &rarr;
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === "messages" && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden h-[700px] flex">
                                {/* Chat List */}
                                <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
                                    <div className="p-4 border-b border-gray-100 bg-white">
                                        <h3 className="font-bold text-gray-900">Messages</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                        {loadingChats && <p className="text-center text-gray-500 text-sm py-4">Loading...</p>}
                                        {!loadingChats && myChats.length === 0 && (
                                            <p className="text-center text-gray-500 text-sm py-10">No messages yet.</p>
                                        )}
                                        {myChats.map(chat => {
                                            const otherParticipant = chat.participants.find(p => p._id !== user._id);
                                            const chatDisplayName = otherParticipant ? otherParticipant.fullName : chat.name || 'Unknown User';
                                            const isSelected = selectedChatId === chat._id;

                                            return (
                                                <div
                                                    key={chat._id}
                                                    onClick={() => setSelectedChatId(chat._id)}
                                                    className={`p-3 rounded-xl cursor-pointer transition-all ${isSelected
                                                        ? 'bg-[#008080] text-white shadow-md shadow-[#008080]/20'
                                                        : 'bg-white hover:bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                            {chatDisplayName}
                                                        </h4>
                                                        {chat.lastMessageAt && (
                                                            <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                                {new Date(chat.lastMessageAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs mt-1 truncate ${isSelected ? 'text-blue-50' : 'text-gray-500'}`}>
                                                        {chat.lastMessage || 'Start a conversation'}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Chat Window */}
                                <div className="flex-1 flex flex-col bg-white">
                                    {selectedChatId ? (
                                        <ChatView selectedChatId={selectedChatId} currentUserId={user._id} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <MessageCircle size={32} />
                                            </div>
                                            <p>Select a conversation to start messaging</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}