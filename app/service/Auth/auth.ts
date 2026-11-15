import Api from "../../service/Api/api";
import type { User } from "../../model/Auth/auth";

export const login = async (email: string, password: string) => {
    try{
        const response = await Api.post('/login', { email, password });
        return response.data as { token: string; user: User };
    }catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const register = async (name: string, email: string, password: string) => {
    try{
        const response = await Api.post('/register', { name, email, password });
        return response.data as { token: string; user: User };
    }catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

