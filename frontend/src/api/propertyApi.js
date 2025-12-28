// src/api/propertyApi.js
import axios from "./api";

export const getAllPropertiesApi = () => {
    return axios.get("/api/properties");
};

export const createPropertyApi = (data) => {
    return axios.post("/api/properties", data);
};

export const getOnePropertyApi = (id) => {
    return axios.get(`/api/properties/${id}`);
};

export const updateOnePropertyApi = (id, data) => {
    return axios.put(`/api/properties/${id}`, data);
};

export const deletePropertyApi = (id) => {
    return axios.delete(`/api/properties/${id}`);
};