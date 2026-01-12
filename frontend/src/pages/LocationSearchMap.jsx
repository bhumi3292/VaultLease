import React, { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiMapPin, FiUploadCloud } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue in leaflet for React (important)
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationPicker({ onSelectLocation }) {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            // Reverse geocode here:
            fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.display_name) {
                        onSelectLocation(data.display_name);
                    } else {
                        onSelectLocation(`${e.latlng.lat}, ${e.latlng.lng}`);
                    }
                })
                .catch(() => {
                    onSelectLocation(`${e.latlng.lat}, ${e.latlng.lng}`);
                });
        },
    });

    return position === null ? null : <Marker position={position}></Marker>;
}

export default function AddPropertyForm() {
    const [locationPickerVisible, setLocationPickerVisible] = useState(false);

    const formik = useFormik({
        initialValues: {
            title: "",
            location: "",
            price: "",
            type: "",
            guests: "",
            bedrooms: "",
            bathrooms: "",
            description: "",
        },
        validationSchema: Yup.object({
            title: Yup.string().required("Title is required"),
            location: Yup.string().required("Location is required"),
            price: Yup.number().positive("Price must be positive").required("Price is required"),
            type: Yup.string().required("Property type is required"),
            guests: Yup.number().positive("Guests count must be positive").required("Guests count is required"),
            bedrooms: Yup.number().min(1, "At least 1 bedroom is required").required("Bedroom count is required"),
            bathrooms: Yup.number().min(1, "At least 1 bathroom is required").required("Bathroom count is required"),
            description: Yup.string()
                .max(250, "Description must be 250 characters or less")
                .required("Description is required"),
        }),
        onSubmit: (values) => {
            console.log("Form Data:", values);
            toast.success("Property added successfully!");
        },
    });

    const onSelectLocation = (location) => {
        formik.setFieldValue("location", location);
        setLocationPickerVisible(false);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-xl rounded-2xl mt-8 mb-12">
            <h2 className="text-2xl font-bold text-[#002B5B] mb-6">Add New Property</h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                {/* Other inputs */}

                {/* Location input with icon */}
                <div className="relative flex flex-col">
                    <label htmlFor="location" className="block font-medium capitalize">
                        Location
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.location}
                        className="w-full p-3 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                        placeholder="Select location or click icon"
                    />
                    <button
                        type="button"
                        onClick={() => setLocationPickerVisible(!locationPickerVisible)}
                        className="absolute right-2 top-9 text-gray-600 hover:text-blue-600"
                        title="Pick location on map"
                    >
                        <FiMapPin size={22} />
                    </button>
                    {formik.touched.location && formik.errors.location && (
                        <p className="text-red-600 text-sm mt-1">{formik.errors.location}</p>
                    )}
                </div>

                {/* Show map popup */}
                {locationPickerVisible && (
                    <div className="mt-4 h-64 rounded-lg overflow-hidden border-2 border-blue-400 shadow-lg">
                        <MapContainer
                            center={[51.505, -0.09]}
                            zoom={13}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationPicker onSelectLocation={onSelectLocation} />
                        </MapContainer>
                    </div>
                )}

                {/* Other inputs and submit button */}
                <button
                    type="submit"
                    className="bg-[#002B5B] text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                    Add Property
                </button>
            </form>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
