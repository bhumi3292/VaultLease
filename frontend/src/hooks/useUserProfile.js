// src/hooks/useUserProfile.js
import { useQuery } from "@tanstack/react-query";
import { getUserProfileService } from "../services/userService";

export const useUserProfile = () => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfileService,
        staleTime: 1000 * 60 * 5, // 5 mins
    });
};
