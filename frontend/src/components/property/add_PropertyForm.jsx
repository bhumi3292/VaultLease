// src/components/property/add_PropertyForm.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiUploadCloud } from 'react-icons/fi';
import { useCreateProperty } from '../../hooks/propertyHook/usePropertyActions.js';
import { getCategoriesApi } from '../../api/categoryApi.js';

export function AddPropertyForm() {
    const imageInputRef = useRef(null);
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const { mutate: createProperty, isLoading: isSubmitting } = useCreateProperty();

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesApi();
                // Handle various potential backend response structures
                const categoryList = response.data.categories || response.data.data || response.data || [];
                setCategories(categoryList);
            } catch (error) {
                toast.error('Failed to load categories.');
            }
        };
        fetchCategories();
    }, []);

    const formik = useFormik({
        initialValues: {
            title: '', location: '', price: '', description: '',
            bedrooms: '', bathrooms: '', categoryId: '',
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Resource Name is required'),
            location: Yup.string().required('Department Building is required'),
            price: Yup.number().positive('Lease Cost must be positive').required('Lease Cost is required'),
            description: Yup.string().max(250, 'Description must be 250 characters or less').required('Description is required'),
            bedrooms: Yup.number().min(0, 'Must be 0 or more').required('Quantity/Units is required'),
            bathrooms: Yup.number().min(0, 'Must be 0 or more').required('Floor Level is required'),
            categoryId: Yup.string().required('Department/Category is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            const formData = new FormData();
            Object.keys(values).forEach(key => formData.append(key, values[key]));
            images.forEach((file) => formData.append('images', file));

            createProperty(formData, {
                onSuccess: () => {
                    resetForm();
                    setImages([]);
                    toast.success('Asset added successfully!');
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || 'Failed to add asset.');
                }
            });
        },
    });

    const handleFileChange = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files);
        setImages(prev => [...prev, ...selectedFiles]);
        e.target.value = null;
    }, []);

    const removeFile = useCallback((index) => {
        setImages(images.filter((_, i) => i !== index));
    }, [images]);

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-xl rounded-2xl mt-8 mb-12">
            <h2 className="text-2xl font-bold text-[#002B5B] mb-6">Add New University Asset</h2>
            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="title" className="font-medium">Resource Name</label>
                        <input type="text" id="title" name="title" {...formik.getFieldProps('title')} placeholder="e.g. Dell XPS, Projector" className="p-3 border rounded bg-gray-100" />
                        {formik.touched.title && formik.errors.title && <p className="text-red-600 text-sm mt-1">{formik.errors.title}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="price" className="font-medium">Lease Cost (per term/month)</label>
                        <input type="number" id="price" name="price" {...formik.getFieldProps('price')} placeholder="0 if free" className="p-3 border rounded bg-gray-100" />
                        {formik.touched.price && formik.errors.price && <p className="text-red-600 text-sm mt-1">{formik.errors.price}</p>}
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="location" className="font-medium">Department Building / Lab</label>
                    <input type="text" id="location" name="location" {...formik.getFieldProps('location')} placeholder="e.g. Science Block, Lab 204" className="p-3 border rounded bg-gray-100" />
                    {formik.touched.location && formik.errors.location && <p className="text-red-600 text-sm mt-1">{formik.errors.location}</p>}
                </div>

                {/* Category Dropdown - Strict Selection Only */}
                <div className="flex flex-col">
                    <label htmlFor="categoryId" className="block font-medium">Department / Category</label>
                    <select id="categoryId" name="categoryId" {...formik.getFieldProps('categoryId')} className="w-full p-3 border rounded bg-gray-100">
                        <option value="">Select Department</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.department_name || category.departmentName || category.category_name}
                            </option>
                        ))}
                    </select>
                    {formik.touched.categoryId && formik.errors.categoryId && <p className="text-red-600 text-sm mt-1">{formik.errors.categoryId}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                        <label htmlFor="bedrooms" className="block font-medium">Quantity / Units Available</label>
                        <input type="number" id="bedrooms" name="bedrooms" {...formik.getFieldProps('bedrooms')} className="w-full p-3 border rounded bg-gray-100" />
                        {formik.touched.bedrooms && formik.errors.bedrooms && <p className="text-red-600 text-sm mt-1">{formik.errors.bedrooms}</p>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="bathrooms" className="block font-medium">Floor Level</label>
                        <input type="number" id="bathrooms" name="bathrooms" {...formik.getFieldProps('bathrooms')} className="w-full p-3 border rounded bg-gray-100" />
                        {formik.touched.bathrooms && formik.errors.bathrooms && <p className="text-red-600 text-sm mt-1">{formik.errors.bathrooms}</p>}
                    </div>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="description" className="font-medium mb-1">Description (Max 250 characters)</label>
                    <textarea id="description" name="description" {...formik.getFieldProps('description')} rows="4" className="p-3 border rounded bg-gray-100 resize-y" maxLength={250}></textarea>
                    {formik.touched.description && formik.errors.description && <p className="text-red-600 text-sm mt-1">{formik.errors.description}</p>}
                    <p className="text-gray-500 text-sm mt-1 text-right">{formik.values.description.length} / 250 characters</p>
                </div>

                <div>
                    <label className="block font-medium mb-1">Upload Images</label>
                    <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl bg-gray-50 text-center cursor-pointer hover:border-blue-400" onClick={() => imageInputRef.current.click()}>
                        <FiUploadCloud className="text-4xl mx-auto text-gray-500" /><p className="text-gray-600">Click to upload or drag & drop images</p>
                        <input type="file" multiple accept="image/*" ref={imageInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                    {images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((file, index) => (
                                <div key={index} className="relative group">
                                    <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="rounded-xl w-full h-32 object-cover" />
                                    <button type="button" onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" disabled={isSubmitting} className="bg-[#002B5B] text-white font-bold py-3 rounded-lg hover:bg-[#001f40] transition disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Add Asset'}
                </button>
            </form>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
    );
}