// src/components/property/update_propertyForm.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUploadCloud, FiMapPin } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategoriesApi } from '../../api/categoryApi.js';
import { useFetchOneProperty, useUpdateProperty } from '../../hooks/propertyHook/usePropertyActions.js';
import { VITE_API_BASE_URL } from '../../utils/env';

const API_BASE_URL = VITE_API_BASE_URL || "http://localhost:3001";

export default function UpdatePropertyForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const [images, setImages] = useState([]); // Newly uploaded File objects
    const [videos, setVideos] = useState([]); // Newly uploaded File objects
    const [existingImages, setExistingImages] = useState([]); // Existing image URLs from DB
    const [existingVideos, setExistingVideos] = useState([]); // Existing video URLs from DB

    const [categories, setCategories] = useState([]);

    // Fetch property data using the custom hook
    const { data: property, isLoading: isPropertyLoading, isError: isPropertyError, error: propertyError } = useFetchOneProperty(id);
    // Use the update mutation hook
    const { mutate: updateProperty, isPending: isUpdating } = useUpdateProperty();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesApi();
                setCategories(response.data.data || response.data.categories || []);
            } catch (error) {
                toast.error('Failed to load categories.');
            }
        };
        fetchCategories();
    }, []);

    // Effect to populate the form once property data is loaded
    useEffect(() => {
        if (property) {
            formik.setValues({
                title: property.title || '', location: property.location || '', price: property.price || '',
                description: property.description || '', bedrooms: property.bedrooms || '',
                bathrooms: property.bathrooms || '', categoryId: property.categoryId?._id || '',
            });

            // Set state for existing media URLs
            setExistingImages(property.images || []);
            setExistingVideos(property.videos || []);
        }
    }, [property]);

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
        onSubmit: (values) => {
            const formData = new FormData();
            Object.entries(values).forEach(([key, val]) => formData.append(key, val));

            // Append newly uploaded files
            images.forEach(file => formData.append('images', file));
            videos.forEach(file => formData.append('videos', file));

            // Append the lists of existing URLs to KEEP as JSON strings
            formData.append('existingImages', JSON.stringify(existingImages));
            formData.append('existingVideos', JSON.stringify(existingVideos));

            updateProperty({ id, data: formData }, {
                onSuccess: () => {
                    navigate("/property");
                },
                onError: (err) => {
                    toast.error(err.response?.data?.message || "Failed to update property.");
                }
            });
        }
    });

    // Handle adding new files
    const handleFileChange = useCallback((e, type) => {
        const selectedFiles = Array.from(e.target.files);
        if (type === "image") setImages(prev => [...prev, ...selectedFiles]);
        else setVideos(prev => [...prev, ...selectedFiles]);
        e.target.value = null;
    }, []);

    // Remove a file from either the new or existing list
    const removeFile = useCallback((type, index, isExisting = false) => {
        if (type === "image") {
            if (isExisting) setExistingImages(prev => prev.filter((_, i) => i !== index));
            else setImages(prev => prev.filter((_, i) => i !== index));
        } else {
            if (isExisting) setExistingVideos(prev => prev.filter((_, i) => i !== index));
            else setVideos(prev => prev.filter((_, i) => i !== index));
        }
    }, []);


    if (isPropertyLoading) {
        return <div className="max-w-4xl mx-auto p-8 text-center">Loading property data...</div>;
    }

    if (isPropertyError) {
        return <div className="max-w-4xl mx-auto p-8 text-center text-red-600">Error: {propertyError.message || "Failed to load property data."}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-xl rounded-2xl mt-8 mb-12">
            <h2 className="text-2xl font-bold text-[#003366] mb-6">Update Property</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col"><label htmlFor="title" className="font-medium">Title</label><input type="text" id="title" name="title" {...formik.getFieldProps('title')} className="p-3 border rounded bg-gray-100" />{formik.touched.title && formik.errors.title && <p className="text-red-600 text-sm mt-1">{formik.errors.title}</p>}</div>
                    <div className="flex flex-col"><label htmlFor="price" className="font-medium">Price</label><input type="number" id="price" name="price" {...formik.getFieldProps('price')} className="p-3 border rounded bg-gray-100" />{formik.touched.price && formik.errors.price && <p className="text-red-600 text-sm mt-1">{formik.errors.price}</p>}</div>
                </div>
                <div className="flex flex-col">
                    <label htmlFor="location" className="font-medium">Location</label>
                    <input type="text" id="location" name="location" {...formik.getFieldProps('location')} className="p-3 border rounded bg-gray-100" />
                    {formik.touched.location && formik.errors.location && <p className="text-red-600 text-sm mt-1">{formik.errors.location}</p>}
                </div>
                <div className="flex flex-col">
                    <label htmlFor="categoryId" className="block font-medium">Category</label>
                    <select id="categoryId" name="categoryId" {...formik.getFieldProps('categoryId')} className="w-full p-3 border rounded bg-gray-100">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.department_name || c.departmentName || c.category_name}</option>)}
                    </select>
                    {formik.touched.categoryId && formik.errors.categoryId && <p className="text-red-600 text-sm mt-1">{formik.errors.categoryId}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col"><label htmlFor="bedrooms" className="block font-medium">Bedrooms</label><input type="number" id="bedrooms" name="bedrooms" {...formik.getFieldProps('bedrooms')} className="w-full p-3 border rounded bg-gray-100" />{formik.touched.bedrooms && formik.errors.bedrooms && <p className="text-red-600 text-sm mt-1">{formik.errors.bedrooms}</p>}</div>
                    <div className="flex flex-col"><label htmlFor="bathrooms" className="block font-medium">Bathrooms</label><input type="number" id="bathrooms" name="bathrooms" {...formik.getFieldProps('bathrooms')} className="w-full p-3 border rounded bg-gray-100" />{formik.touched.bathrooms && formik.errors.bathrooms && <p className="text-red-600 text-sm mt-1">{formik.errors.bathrooms}</p>}</div>
                </div>
                <div className="flex flex-col"><label htmlFor="description" className="font-medium mb-1">Description (Max 250 characters)</label><textarea id="description" name="description" {...formik.getFieldProps('description')} rows="4" className="p-3 border rounded bg-gray-100 resize-y" maxLength={250}></textarea>{formik.touched.description && formik.errors.description && <p className="text-red-600 text-sm mt-1">{formik.errors.description}</p>}<p className="text-gray-500 text-sm mt-1 text-right">{formik.values.description.length} / 250 characters</p></div>

                {/* Existing Images Display */}
                {existingImages.length > 0 && (
                    <div className="mt-4"><p className="font-medium mb-2">Current Images:</p><div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((url, index) => (<div key={`existing-img-${index}`} className="relative group">
                            <img src={`${API_BASE_URL}/${url}`} alt={`existing-${index}`} className="rounded-xl w-full h-32 object-cover" />
                            <button type="button" onClick={() => removeFile("image", index, true)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                        </div>))}
                    </div></div>
                )}

                {/* Existing Videos Display */}
                {existingVideos.length > 0 && (
                    <div className="mt-4"><p className="font-medium mb-2">Current Videos:</p><div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingVideos.map((url, index) => (<div key={`existing-vid-${index}`} className="relative group">
                            <video src={`${API_BASE_URL}/${url}`} controls className="rounded-xl w-full h-32 object-cover" />
                            <button type="button" onClick={() => removeFile("video", index, true)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                        </div>))}
                    </div></div>
                )}

                {/* New Image Upload */}
                <div><label className="block font-medium mb-1">Upload New Images</label><div className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400" onClick={() => imageInputRef.current.click()}>
                    <FiUploadCloud className="text-4xl mx-auto text-gray-500" /><p className="text-gray-600">Click to upload or drag & drop new images</p>
                    <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} className="hidden" />
                </div>
                    {images.length > 0 && (<div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"><p className="col-span-full font-medium">New Images:</p>{images.map((file, index) => (<div key={`new-img-${index}`} className="relative group"><img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="rounded-xl w-full h-32 object-cover" /><button type="button" onClick={() => removeFile("image", index)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button></div>))}</div>)}</div>

                {/* New Video Upload */}
                <div><label className="block font-medium mb-1">Upload New Videos</label><div className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400" onClick={() => videoInputRef.current.click()}>
                    <FiUploadCloud className="text-4xl mx-auto text-gray-500" /><p className="text-gray-600">Click to upload or drag & drop new videos</p>
                    <input type="file" multiple accept="video/*" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} className="hidden" />
                </div>
                    {videos.length > 0 && (<div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"><p className="col-span-full font-medium">New Videos:</p>{videos.map((file, index) => (<div key={`new-vid-${index}`} className="relative group"><video src={URL.createObjectURL(file)} controls className="rounded-xl w-full h-32 object-cover" /><button type="button" onClick={() => removeFile("video", index)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button></div>))}</div>)}</div>

                {/* Submit Button */}
                <button type="submit" disabled={isUpdating} className="bg-[#002B5B] text-white font-bold py-3 rounded-lg hover:bg-[#001f40] transition disabled:opacity-50">
                    {isUpdating ? 'Updating...' : 'Update Property'}
                </button>
            </form>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}