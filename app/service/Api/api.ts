import axios from "axios";

const api = axios.create({
    // Use the Next.js proxy so browser requests stay same-origin (no CORS issue).
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Read the current token for every request. This also covers requests that
// start during the initial render before AuthContext has restored its state.
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("token");

        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        } else {
            config.headers.delete("Authorization");
        }
    }

    return config;
});

export default api;
