// src/pages/PropertyPage.jsx
import React, { useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../properties/PropertyCard.jsx";
import { useFetchProperties, useDeleteProperty } from "../hooks/propertyHook/usePropertyActions.js";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesApi } from "../api/categoryApi.js";
import { Search } from 'lucide-react';
import debounce from "lodash.debounce";
import { toast } from "react-toastify";
import { AuthContext } from "../auth/AuthProvider.jsx";

export default function PropertyPage() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // Get user from context for ownership checks
    const [filter, setFilter] = useState({ category: "all", price: "all", location: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    const { data: properties, isLoading: isLoadingProperties, isError, error } = useFetchProperties();
    const { mutate: deletePropertyMutation, isPending: isDeleting } = useDeleteProperty();

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await getCategoriesApi();
            return res.data.data;
        },
        onError: () => toast.error("Failed to load categories."),
    });

    const debouncedUpdate = useCallback(debounce(val => setDebouncedSearch(val), 300), []);
    const handleSearchChange = e => { setSearchTerm(e.target.value); debouncedUpdate(e.target.value); };

    // Memoized filtering logic
    const filteredProperties = React.useMemo(() => {
        if (!properties) return [];
        return properties.filter(p => {
            // Alias backend fields to frontend expected names
            const title = p.title || p.roomName || "";
            const categoryName = p.departmentId?.departmentName || p.categoryId?.category_name || "";
            const price = p.price || 0; // Assuming price might be relevant, or maybe 'borrowing fee'
            const location = p.location || "";

            const matchSearch = title.toLowerCase().includes(debouncedSearch.toLowerCase());

            // Filter by Department (was Category)
            const matchCat = filter.category === "all" || (categoryName.toLowerCase() === filter.category.toLowerCase());

            // Filter by Price (or Fee)
            // University assets might not have a price, but if they do (e.g. lease cost), keep logic.
            // If price is undefined/0 for free items, handle accordingly.
            const matchPrice = filter.price === "all" ||
                (filter.price === "low" && price <= 15000) ||
                (filter.price === "medium" && price > 15000 && price <= 30000) ||
                (filter.price === "high" && price > 30000);

            const matchLocation = filter.location.trim() === "" || location.toLowerCase().includes(filter.location.toLowerCase());

            return matchSearch && matchCat && matchPrice && matchLocation;
        });
    }, [properties, debouncedSearch, filter]);

    const start = (currentPage - 1) * rowsPerPage;
    const currentProps = filteredProperties.slice(start, start + rowsPerPage);
    const totalPages = Math.ceil(filteredProperties.length / rowsPerPage);

    const handleDeleteProperty = (propertyId) => {
        deletePropertyMutation(propertyId);
    };

    if (isLoadingProperties || isLoadingCategories) {
        return <div className="p-10 text-center text-gray-500 text-lg">Loading resources...</div>;
    }

    if (isError) {
        return <div className="p-10 text-center text-red-500 text-lg">Error: {error.message}</div>;
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Filter & Search Panel */}
            <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-xl shadow-lg border border-gray-200">

                {/* Department Filter (formerly Category) */}
                <div className="flex-1 min-w-[180px]">
                    <label htmlFor="category-select" className="text-sm font-medium text-gray-700 block mb-1">Department</label>
                    <select id="category-select" className="w-full p-2 border rounded-md" value={filter.category} onChange={e => setFilter(s => ({ ...s, category: e.target.value }))}>
                        <option value="all">All Departments</option>
                        {categories.map(c => (
                            <option key={c._id} value={c.departmentName || c.category_name}>
                                {c.departmentName || c.category_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lease/Fee Filter (formerly Price) */}
                <div className="w-40 min-w-[120px]">
                    <label htmlFor="price-select" className="text-sm font-medium text-gray-700 block mb-1">Lease Cost</label>
                    <select id="price-select" className="w-full p-2 border rounded-md" value={filter.price} onChange={e => setFilter(s => ({ ...s, price: e.target.value }))}>
                        <option value="all">Any Cost</option>
                        <option value="low">Low (≤ 15k)</option>
                        <option value="medium">Medium (15k-30k)</option>
                        <option value="high">High (&gt; 30k)</option>
                    </select>
                </div>

                {/* Campus Location Filter (formerly Location) */}
                <div className="flex-1 min-w-[200px] relative">
                    <label htmlFor="location-input" className="text-sm font-medium text-gray-700 block mb-1">Campus Location</label>
                    <Search className="absolute left-3 top-[34px] text-gray-400" size={20} />
                    <input id="location-input" className="w-full pl-10 p-2 border rounded-md" type="text" placeholder="e.g. Science Block, Lab 2" value={filter.location} onChange={e => setFilter(s => ({ ...s, location: e.target.value }))} />
                </div>

                {/* Search Box */}
                <div className="flex-1 md:flex-auto relative min-w-[200px]">
                    <label htmlFor="search-input" className="sr-only">Search by name</label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input id="search-input" className="w-full pl-10 p-2 border rounded-md" type="text" placeholder="Search resources..." value={searchTerm} onChange={handleSearchChange} />
                </div>

                <button className="px-5 py-2 bg-[#008080] text-white rounded-md hover:bg-[#006666] self-end" onClick={() => { setFilter({ category: "all", price: "all", location: "" }); setSearchTerm(""); debouncedUpdate(""); setCurrentPage(1); }}>
                    Reset Filters
                </button>
            </div>

            {/* Property Grid */}
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                {currentProps.length ? (
                    currentProps.map(p => (
                        <PropertyCard
                            key={p._id}
                            property={p}
                            currentUserId={user?._id}
                            onUpdate={() => navigate(`/update-property/${p._id}`)}
                            onDelete={() => handleDeleteProperty(p._id)}
                            isDeleting={isDeleting}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center text-gray-500 py-20 text-lg">
                        <p>No properties match your current filters or search term.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                    <button onClick={() => setCurrentPage(cp => Math.max(cp - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border rounded-md bg-white disabled:opacity-50">Previous</button>
                    {[...Array(totalPages)].map((_, i) => (<button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 rounded-md font-medium ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-blue-50'}`}>{i + 1}</button>))}
                    <button onClick={() => setCurrentPage(cp => Math.min(cp + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-md bg-white disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
}