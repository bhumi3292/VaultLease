import axios from "./api";

export const createCategoryApi = (data) => {
    return axios.post("/api/departments", data);
};

// Get all categories
export const getCategoriesApi = () => {
    return axios.get("/api/departments");
};


export const getCategoryByIdApi = (id) => {
    return axios.get(`/api/departments/${id}`);
};


export const updateCategoryApi = (id, data) => {
    return axios.put(`/api/departments/${id}`, data);
};


export const deleteCategoryApi = (id) => {
    return axios.delete(`/api/departments/${id}`);
};