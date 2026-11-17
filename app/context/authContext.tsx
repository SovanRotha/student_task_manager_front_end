
"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

import {
    login as loginService,
    register as registerService,
    normalizeUser,
    
} from "../service/Auth/auth";

import Api from "../service/Api/api";
import { User } from "../model/Auth/auth";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore authentication when refreshing the browser
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (savedToken) {
            setToken(savedToken);
            Api.defaults.headers.common["Authorization"] =
                `Bearer ${savedToken}`;
        }

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser) as User);
            } catch {
                localStorage.removeItem("user");
                setUser(normalizeUser(null, savedToken ?? ""));
            }
        } else if (savedToken) {
            const restoredUser = normalizeUser(null, savedToken);
            setUser(restoredUser);
            if (restoredUser) localStorage.setItem("user", JSON.stringify(restoredUser));
        }

        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const data = await loginService(email, password);

        setUser(data.user);
        setToken(data.token);

        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        Api.defaults.headers.common["Authorization"] =
            `Bearer ${data.token}`;
    };

    const register = async (
        name: string,
        email: string,
        password: string
    ): Promise<boolean> => {
        const data = await registerService(name, email, password);

        if (!data.token) return false;

        setUser(data.user);
        setToken(data.token);

        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        Api.defaults.headers.common["Authorization"] =
            `Bearer ${data.token}`;
        return true;
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        delete Api.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthContextProvider"
        );
    }

    return context;
};
