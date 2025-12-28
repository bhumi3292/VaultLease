import axios from "./api";

export const createCategoryApi = (data) => {
    return axios.post("/api/category", data);
};

// Get all categories
export const getCategoriesApi = () => {
    return axios.get("/api/category");
};


export const getCategoryByIdApi = (id) => {
    return axios.get(`/api/category/${id}`);
};


export const updateCategoryApi = (id, data) => {
    return axios.put(`/api/category/${id}`, data);
};


export const deleteCategoryApi = (id) => {
    return axios.delete(`/api/category/${id}`);
};