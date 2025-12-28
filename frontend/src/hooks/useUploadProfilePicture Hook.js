import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { uploadProfilePictureService } from "../services/authService.jsx";


export const useUploadProfilePicture = () => {
    return useMutation({

        mutationFn: (file) => uploadProfilePictureService(file),
        mutationKey: ['uploadProfilePicture'],
        onSuccess: (data) => {
            toast.success(data.message || "Profile picture uploaded successfully!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to upload profile picture.");
        },
    });
};

