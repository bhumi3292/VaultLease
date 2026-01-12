// src/api/propertyApi.js
import axios from "./api";

export const getAllPropertiesApi = () => {
    return axios.get("/api/spaces");
};

export const createPropertyApi = (data) => {
    return axios.post("/api/spaces", data);
};

export const getOnePropertyApi = (id) => {
    return axios.get(`/api/spaces/${id}`);
};

export const updateOnePropertyApi = (id, data) => {
    return axios.put(`/api/spaces/${id}`, data);
};

export const deletePropertyApi = (id) => {
    return axios.delete(`/api/spaces/${id}`);
};