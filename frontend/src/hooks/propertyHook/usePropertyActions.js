// src/hooks/propertyHook/usePropertyActions.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    createPropertyService,
    fetchPropertiesService,
    fetchPropertyById,
    updatePropertyService,
    deletePropertyService,
} from "../../services/addPropertyService.jsx";

// Hook for creating a property
export const useCreateProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPropertyService,
        onSuccess: () => {
            toast.success("Property created successfully!");
            queryClient.invalidateQueries({ queryKey: ["admin_property_list"] });
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || "Failed to create property";
            toast.error(errorMessage);
            console.error("Error creating property:", error);
        }
    });
};

// Hook for fetching all properties
export const useFetchProperties = () => {
    return useQuery({
        queryKey: ["admin_property_list"],
        queryFn: fetchPropertiesService,
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to load properties");
            console.error("Error fetching properties:", error);
        }
    });
};

// Hook for fetching a single property
export const useFetchOneProperty = (id) => {
    return useQuery({
        queryKey: ["property", id],
        queryFn: () => fetchPropertyById(id),
        enabled: !!id,
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to load property details");
            console.error("Error fetching single property:", error);
        }
    });
};

// Hook for updating a property
export const useUpdateProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => updatePropertyService(id, data),
        onSuccess: (_, variables) => {
            toast.success("Property updated successfully");
            queryClient.invalidateQueries({ queryKey: ["admin_property_list"] });
            queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update property");
            console.error("Error updating property:", error);
        }
    });
};

// Hook for deleting a property
export const useDeleteProperty = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deletePropertyService,
        onSuccess: () => {
            toast.success("Property deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin_property_list"] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete property");
            console.error("Error deleting property:", error);
        }
    });
};