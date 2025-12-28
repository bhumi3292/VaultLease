import axiosInstance from "./axiosInstance";

export const fetchCategories = () => axiosInstance.get("/category");

export const fetchCategoryById = (id) => axiosInstance.get(`/category/${id}`);

export const createCategory = (data) => axiosInstance.post("/category", data);

export const updateCategory = (id, data) => axiosInstance.put(`/category/${id}`, data);

export const deleteCategory = (id) => axiosInstance.delete(`/category/${id}`);
