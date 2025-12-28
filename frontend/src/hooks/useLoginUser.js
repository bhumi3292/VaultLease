import { toast } from "react-toastify";
import { loginUserService } from "../services/authService";


import { useMutation } from "@tanstack/react-query";
import { AuthContext } from "../auth/AuthProvider.jsx";
import { useContext } from "react";
export const useLoginUser = () => {
    const { login } = useContext(AuthContext);

    return useMutation({
        mutationFn: loginUserService,
        mutationKey: ['login-key'],
        onSuccess: (data) => {
            if (!data.mfaRequired) {
                login(data?.user, data?.token);
                toast.success(data?.message || "Login Success");
            }
        },
        onError: (err) => {
            toast.error(err?.message || "Login Failed");
        },
    });
}


