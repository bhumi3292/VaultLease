// src/api/userApi.js
import axios from "./api";

export const getUserProfileApi = () => {
    return axios.get("/api/users/profile");
};

