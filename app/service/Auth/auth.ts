import Api from "../../service/Api/api";
import type { User } from "../../model/Auth/auth";

function getUserIdFromToken(token: string): number | undefined {
    try {
        const payloadPart = token.split(".")[1];
        if (!payloadPart) return undefined;

        const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64)) as Record<string, unknown>;
        const candidate = payload.user_id ?? payload.userId ?? payload.id ?? payload.sub;
        const id = typeof candidate === "number" ? candidate : Number(candidate);

        return Number.isInteger(id) && id > 0 ? id : undefined;
    } catch {
        return undefined;
    }
}

export function normalizeUser(value: unknown, token: string): User | null {
    const raw = value && typeof value === "object"
        ? value as Record<string, unknown>
        : {};
    const candidate = raw.id ?? raw.user_id ?? raw.userId ?? getUserIdFromToken(token);
    const id = typeof candidate === "number" ? candidate : Number(candidate);

    if (!Number.isInteger(id) || id <= 0) return null;

    return {
        ...raw,
        id,
        name: typeof raw.name === "string" ? raw.name : undefined,
        email: typeof raw.email === "string" ? raw.email : undefined,
    } as User;
}

export const login = async (email: string, password: string) => {
    try{
        const response = await Api.post('/auth/login', { email, password });
        const payload = response.data as {
            token?: string;
            access_token?: string;
            user?: User;
        };
        const token = payload.token ?? payload.access_token;

        if (!token) {
            throw new Error("The login response did not include an authentication token.");
        }

        return { token, user: normalizeUser(payload.user, token) };
    }catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const register = async (name: string, email: string, password: string) => {
    try{
        const response = await Api.post('/register', { name, email, password });
        const payload = response.data as {
            token?: string;
            access_token?: string;
            user?: unknown;
        };
        const token = payload.token ?? payload.access_token;

        if (!token) throw new Error("The registration response did not include an authentication token.");

        return { token, user: normalizeUser(payload.user, token) };
    }catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};

