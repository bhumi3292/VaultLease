import { useState } from "react";
import { registerUserService } from "../services/authService";

export const useRegisterUser = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)

    const register = async (formData) => {
        // when user click an event/button
        setIsLoading(true)
        setError(null)
        setData(null)
        try{
            const response = await registerUserService(formData)
            setData(response)
            return response
        }catch(err){
            setError(err)
            return null
        }finally{
            setIsLoading(false)
        }
    }
    return {
        register,
        isLoading,
        data,
        error
    }
}