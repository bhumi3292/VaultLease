// src/components/property/add_PropertyForm.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UploadCloud, MapPin, PlusCircle, Check, ChevronRight, ChevronLeft, Home, FileText, Image as ImageIcon, Crosshair } from 'lucide-react';
import { useCreateProperty } from '../../hooks/propertyHook/usePropertyActions.js';
import { getCategoriesApi, createCategoryApi } from '../../api/categoryApi.js';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Modal component for adding a new category
const AddCategoryModal = ({ isVisible, onClose, onCategoryAdded }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Category name cannot be empty');
            return;
        }
        setIsLoading(true);
        try {
            const response = await createCategoryApi({ name: newCategoryName });
            toast.success(response.data.message);
            onCategoryAdded(response.data.data); // Pass the new category object back
            setNewCategoryName('');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add category');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Add New Category</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full p-4 border border-gray-200 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body text-gray-700"
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium" disabled={isLoading}>Cancel</button>
                    <button onClick={handleAddCategory} className="bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-primary-hover disabled:opacity-70 shadow-lg shadow-primary/20" disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Category'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Map Component to handle clicks and updates
const LocationMarker = ({ position, setPosition, setFieldValue }) => {
    const map = useMap();

    // Fly to position when it changes
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    const mapEvents = useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            // Reverse Geocoding
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await response.json();
                if (data && data.display_name) {
                    setFieldValue('location', data.display_name);
                }
            } catch (error) {
                console.error("Geocoding error:", error);
                toast.error("Could not fetch address for this location.");
            }
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};


export default function AddPropertyForm() {
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const { mutate: createProperty, isLoading: isSubmitting } = useCreateProperty();
    const [step, setStep] = useState(1);

    // Map State
    const [mapPosition, setMapPosition] = useState({ lat: 27.7172, lng: 85.3240 }); // Default: Kathmandu
    const [isMapReady, setIsMapReady] = useState(false);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesApi();
                setCategories(response.data.data);
            } catch (error) {
                toast.error('Failed to load categories.');
            }
        };
        fetchCategories();
        // Delay map rendering slightly to ensure container size is correct if inside tabs/steps
        setTimeout(() => setIsMapReady(true), 100);
    }, []);

    const formik = useFormik({
        initialValues: {
            title: '', location: '', price: '', description: '',
            bedrooms: '', bathrooms: '', categoryId: '',
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            location: Yup.string().required('Location is required'),
            price: Yup.number().positive('Price must be positive').required('Price is required'),
            description: Yup.string().max(250, 'Description must be 250 characters or less').required('Description is required'),
            bedrooms: Yup.number().min(0, 'Must be 0 or more').required('Bedroom count is required'),
            bathrooms: Yup.number().min(0, 'Must be 0 or more').required('Bathroom count is required'),
            categoryId: Yup.string().required('Category is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            if (images.length === 0) {
                toast.error("Please upload at least one image.");
                return;
            }

            const formData = new FormData();
            Object.keys(values).forEach(key => formData.append(key, values[key]));
            images.forEach((file) => formData.append('images', file));
            videos.forEach((file) => formData.append('videos', file));

            createProperty(formData, {
                onSuccess: () => {
                    resetForm();
                    setImages([]);
                    setVideos([]);
                    setStep(1);
                    toast.success('Property added successfully!');
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || 'Failed to add property.');
                }
            });
        },
    });

    const handleFileChange = useCallback((e, type) => {
        const selectedFiles = Array.from(e.target.files);
        if (type === "image") {
            setImages(prev => [...prev, ...selectedFiles]);
        } else {
            setVideos(prev => [...prev, ...selectedFiles]);
        }
        e.target.value = null;
    }, []);

    const removeFile = useCallback((type, index) => {
        if (type === "image") setImages(images.filter((_, i) => i !== index));
        else setVideos(videos.filter((_, i) => i !== index));
    }, [images, videos]);

    const handleCategoryAdded = (newCategory) => {
        setCategories(prevCategories => [...prevCategories, newCategory]);
        formik.setFieldValue('categoryId', newCategory._id);
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapPosition({ lat: latitude, lng: longitude });

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data && data.display_name) {
                            formik.setFieldValue('location', data.display_name);
                            toast.success("Location retrieved!");
                        }
                    } catch (error) {
                        toast.error("Could not fetch address details.");
                    }
                },
                (error) => {
                    toast.error("Unable to retrieve your location. Please check permissions.");
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser.");
        }
    };

    const nextStep = () => {
        // Simple validation check before proceeding
        if (step === 1) {
            if (!formik.values.title || !formik.values.location || !formik.values.price || !formik.values.categoryId) {
                toast.error("Please fill in all basic fields.");
                return;
            }
        } else if (step === 2) {
            if (!formik.values.bedrooms || !formik.values.bathrooms || !formik.values.description) {
                toast.error("Please fill in all detail fields.");
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">

            {/* Steps Indicator */}
            <div className="mb-8 px-4">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-300`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>

                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`flex flex-col items-center gap-2 bg-background px-2`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${step >= s ? 'bg-primary text-white scale-110' : 'bg-white text-gray-400 border border-gray-200'}`}>
                                {step > s ? <Check size={18} /> : s}
                            </div>
                            <span className={`text-xs font-medium ${step >= s ? 'text-primary' : 'text-gray-400'}`}>
                                {s === 1 && 'Basics'}
                                {s === 2 && 'Details'}
                                {s === 3 && 'Media'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-8 shadow-xl rounded-3xl border border-gray-100">
                <form onSubmit={(e) => {
                    e.preventDefault();
                }} className="flex flex-col gap-6">

                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex items-center gap-2 mb-2 text-gray-800">
                                <Home className="text-primary" size={24} />
                                <h2 className="text-2xl font-bold font-heading">The Basics</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col">
                                    <label className="font-semibold text-sm mb-1.5 text-gray-700">Property Title</label>
                                    <input type="text" placeholder="e.g. Modern Apartment in City Center" {...formik.getFieldProps('title')} className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 outline-none transition-all" />
                                    <p className="text-xs text-gray-400 mt-1">Make it catchy! A good title attracts 3x more views.</p>
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold text-sm mb-1.5 text-gray-700">Monthly Rent (Rs)</label>
                                    <input type="number" placeholder="e.g. 25000" {...formik.getFieldProps('price')} className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 outline-none transition-all" />
                                    <p className="text-xs text-gray-400 mt-1">Set a fair price to rent faster.</p>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="font-semibold text-sm mb-1.5 text-gray-700">Location</label>
                                <div className="space-y-3">
                                    {/* Input with Auto-Fill Icon */}
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="e.g. Lazimpat, Kathmandu or select on map"
                                            {...formik.getFieldProps('location')}
                                            className="w-full pl-10 pr-12 p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 outline-none transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleGetCurrentLocation}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Use my current location"
                                        >
                                            <Crosshair size={18} />
                                        </button>
                                    </div>

                                    {/* Map Container */}
                                    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
                                        {isMapReady && (
                                            <MapContainer
                                                center={mapPosition}
                                                zoom={13}
                                                style={{ height: '100%', width: '100%' }}
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <LocationMarker
                                                    position={mapPosition}
                                                    setPosition={setMapPosition}
                                                    setFieldValue={formik.setFieldValue}
                                                />
                                            </MapContainer>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">Click on map to maximize accuracy or use the GPS button.</p>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="font-semibold text-sm mb-1.5 text-gray-700">Category</label>
                                <div className="flex items-center gap-2">
                                    <select {...formik.getFieldProps('categoryId')} className="flex-grow p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 outline-none transition-all">
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>{category.category_name}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => setIsCategoryModalVisible(true)} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
                                        <PlusCircle size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex items-center gap-2 mb-2 text-gray-800">
                                <FileText className="text-primary" size={24} />
                                <h2 className="text-2xl font-bold font-heading">Property Details</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col">
                                    <label className="font-semibold text-sm mb-1.5 text-gray-700">Bedrooms</label>
                                    <input type="number" placeholder="0" {...formik.getFieldProps('bedrooms')} className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 outline-none transition-all" />
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold text-sm mb-1.5 text-gray-700">Bathrooms</label>
                                    <input type="number" placeholder="0" {...formik.getFieldProps('bathrooms')} className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="font-semibold text-sm mb-1.5 text-gray-700">Description</label>
                                <textarea {...formik.getFieldProps('description')} rows="6" placeholder="Tell us about the property..." className="p-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 outline-none transition-all resize-none" maxLength={250}></textarea>
                                <p className="text-gray-400 text-xs mt-1 text-right">{formik.values.description.length} / 250</p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Media */}
                    {step === 3 && (
                        <div className="animate-fade-in space-y-8">
                            <div className="flex items-center gap-2 mb-2 text-gray-800">
                                <ImageIcon className="text-primary" size={24} />
                                <h2 className="text-2xl font-bold font-heading">Media Upload</h2>
                            </div>

                            <div>
                                <label className="block font-semibold text-sm mb-3 text-gray-700">Property Images</label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-primary/50 p-8 rounded-2xl bg-gray-50 text-center cursor-pointer transition-colors group" onClick={() => imageInputRef.current.click()}>
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                        <UploadCloud className="text-primary" size={28} />
                                    </div>
                                    <p className="text-gray-600 font-medium">Click to upload images</p>
                                    <p className="text-gray-400 text-sm mt-1">SVG, PNG, JPG (Max 5)</p>
                                    <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                                </div>
                                {images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                                        {images.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="rounded-xl w-full h-24 object-cover shadow-sm border border-gray-100" />
                                                <button type="button" onClick={() => removeFile("image", index)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block font-semibold text-sm mb-3 text-gray-700">Property Video (Optional)</label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-primary/50 p-6 rounded-2xl bg-gray-50 text-center cursor-pointer transition-colors" onClick={() => videoInputRef.current.click()}>
                                    <p className="text-gray-500 text-sm">Click to upload a video walk-through</p>
                                    <input type="file" multiple accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
                                </div>
                                {videos.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        {videos.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <video src={URL.createObjectURL(file)} className="rounded-xl w-full h-32 object-cover bg-black" />
                                                <button type="button" onClick={() => removeFile("video", index)} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-6 mt-2 border-t border-gray-100">
                        {step > 1 ? (
                            <button type="button" onClick={prevStep} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center gap-2 transition-colors">
                                <ChevronLeft size={18} /> Back
                            </button>
                        ) : (
                            <div></div> // Spacer
                        )}

                        {step < 3 ? (
                            <button
                                key="next-step-btn"
                                type="button"
                                onClick={(e) => { e.preventDefault(); nextStep(); }}
                                className="px-8 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                key="submit-btn"
                                type="button"
                                onClick={() => formik.handleSubmit()}
                                disabled={isSubmitting}
                                className="px-8 py-2.5 rounded-xl bg-secondary text-white font-bold hover:bg-[#e09252] flex items-center gap-2 shadow-lg shadow-secondary/20 transition-all disabled:opacity-70"
                            >
                                {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                            </button>
                        )}
                    </div>

                </form>
                <AddCategoryModal isVisible={isCategoryModalVisible} onClose={() => setIsCategoryModalVisible(false)} onCategoryAdded={handleCategoryAdded} />
                <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
        </div>
    );
}