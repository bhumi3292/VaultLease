// src/services/userService.js
import { getUserProfileApi } from "../api/userApi";

export const getUserProfileService = async () => {
    try {
        const response = await getUserProfileApi();
        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Failed to fetch user profile" };
    }
};
