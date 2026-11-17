"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import axios from "axios";
import type { DashboardData } from "../model/dashboard/dashboard";
import { getDashboard } from "../service/dashboard/dashboard";

interface DashboardContextValue {
    dashboard: DashboardData | null;
    loading: boolean;
    error: string | null;
    fetchDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

function getErrorMessage(err: unknown): string {
    if (!axios.isAxiosError(err)) return "Could not load dashboard.";
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (detail !== undefined) return JSON.stringify(detail);
    if (err.response) return `Could not load dashboard (HTTP ${err.response.status}).`;
    return "Could not load dashboard. Check that the backend is running.";
}

export function DashboardContextProvider({ children }: { children: ReactNode }) {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setDashboard(await getDashboard());
        } catch (err) {
            console.error("Failed to load dashboard:", err);
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <DashboardContext.Provider value={{ dashboard, loading, error, fetchDashboard }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within DashboardContextProvider");
    }
    return context;
}
