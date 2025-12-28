import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../auth/AuthProvider';
import { Upload, X, Building, Tag, MapPin, Hash } from 'lucide-react';

const AddAssetPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: '',
        serialNumber: '',
        description: '',
        location: '',
        category: '64e8a2b5e0c50a1c8c8e1234', // Needs dynamic category lookup really, but for now placeholder or use text
        accessFee: 0,
        condition: 'Good',
        department: user?.department || ''
    });

    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock categories for dropdown if we don't fetch
    // const categories = ['Equipment', 'Lab Room', 'Device', 'Book'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.warning("Maximum 5 images allowed.");
            return;
        }

        setImages([...images, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previewImages];
        URL.revokeObjectURL(newPreviews[index]); // cleanup
        newPreviews.splice(index, 1);
        setPreviewImages(newPreviews);
    };

    // Category Fetching
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://localhost:3001/api/category');
                if (res.data && res.data.data) {
                    setCategories(res.data.data || []);
                    // Set default category if available
                    if (res.data.data.length > 0 && formData.category === '64e8a2b5e0c50a1c8c8e1234') {
                        setFormData(prev => ({ ...prev, category: res.data.data[0]._id }));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch categories", err);
                // Fallback or toast?
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('serialNumber', formData.serialNumber);
            data.append('description', formData.description);
            data.append('location', formData.location);
            data.append('category', formData.category);
            data.append('accessFee', formData.accessFee);
            data.append('condition', formData.condition);
            data.append('department', formData.department);

            // Append Images
            images.forEach((image) => {
                data.append('images', image);
            });

            const response = await axios.post('http://localhost:3001/api/assets',
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                toast.success("Asset added successfully!");
                navigate('/assets');
            }
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Failed to add asset";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-slate-900 text-white">
                    <h1 className="text-2xl font-bold">Add New Asset</h1>
                    <p className="text-slate-400 text-sm mt-1">Register equipment or resources for your department</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Asset Name</label>
                            <input name="name" type="text" required className="w-full rounded-lg border-gray-300 border p-2.5 focus:border-primary focus:ring-primary" placeholder="e.g. Oscilloscope X200" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Serial Number / Asset ID</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Hash size={16} /></span>
                                <input name="serialNumber" type="text" required className="w-full pl-10 rounded-lg border-gray-300 border p-2.5 focus:border-primary focus:ring-primary" placeholder="SN-12345" onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><MapPin size={16} /></span>
                                <input name="location" type="text" required className="w-full pl-10 rounded-lg border-gray-300 border p-2.5 focus:border-primary focus:ring-primary" placeholder="Building C, Room 302" onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Building size={16} /></span>
                                <input name="department" type="text" value={formData.department} readOnly className="w-full pl-10 rounded-lg border-gray-300 bg-gray-50 border p-2.5 text-gray-500 cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea name="description" rows="3" className="w-full rounded-lg border-gray-300 border p-2.5 focus:border-primary focus:ring-primary" onChange={handleChange}></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                            {categories.length > 0 ? (
                                <select name="category" required className="w-full rounded-lg border-gray-300 border p-2.5" onChange={handleChange} value={formData.category}>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input name="category" type="text" required className="w-full rounded-lg border-gray-300 border p-2.5" placeholder="Loading categories..." onChange={handleChange} value={formData.category} />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Condition</label>
                            <select name="condition" className="w-full rounded-lg border-gray-300 border p-2.5" onChange={handleChange}>
                                <option>Good</option>
                                <option>Fair</option>
                                <option>New</option>
                                <option>Damaged</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Access Fee ($)</label>
                            <input name="accessFee" type="number" min="0" className="w-full rounded-lg border-gray-300 border p-2.5" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Image Upload UI */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="asset-images" />
                        <label htmlFor="asset-images" className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-primary transition-colors">
                            <Upload size={32} className="mb-2" />
                            <span className="font-medium">Click to upload images</span>
                            <span className="text-xs mt-1">JPG, PNG up to 5MB (Max 5)</span>
                        </label>
                    </div>

                    {/* Previews */}
                    {previewImages.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {previewImages.map((src, idx) => (
                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={() => navigate('/assets')} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium mr-4 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover shadow-lg">
                            {loading ? 'Saving...' : 'Create Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssetPage;
