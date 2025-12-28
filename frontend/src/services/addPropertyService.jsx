// src/services/addPropertyService.jsx
import {
    getAllPropertiesApi,
    getOnePropertyApi,
    createPropertyApi,
    updateOnePropertyApi,
    deletePropertyApi
} from "../api/propertyApi";

export const fetchPropertiesService = async () => {
    const res = await getAllPropertiesApi();
    return res.data.data;
};

export const fetchPropertyById = async (id) => {
    const res = await getOnePropertyApi(id);
    return res.data.data;
};

export const createPropertyService = (formData) => createPropertyApi(formData);
export const updatePropertyService = (id, formData) => updateOnePropertyApi(id, formData);
export const deletePropertyService = (id) => deletePropertyApi(id);