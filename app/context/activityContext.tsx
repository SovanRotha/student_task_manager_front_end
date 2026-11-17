"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import { useAuth } from "./authContext";
import type { ActivityLog } from "../model/activity/activity";
import axios from "axios";
import {
    createActivityLog,
    deleteActivityLog,
    getActivityLogById,
    getActivityLogsByUser,
} from "../service/activity/activity";

interface ActivityContextValue {
    activities: ActivityLog[];
    loading: boolean;
    error: string | null;
    fetchActivities: () => Promise<void>;
    fetchActivityById: (id: number) => Promise<ActivityLog | null>;
    logActivity: (action: string, description: string, taskId?: number | null) => Promise<void>;
    removeActivity: (id: number) => Promise<void>;
}

const ActivityContext = createContext<ActivityContextValue | undefined>(undefined);

function getApiErrorMessage(err: unknown, fallback: string): string {
    if (!axios.isAxiosError(err)) return fallback;

    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (detail !== undefined) return JSON.stringify(detail);
    if (err.response) return `${fallback} (HTTP ${err.response.status})`;
    return `${fallback} Check that the backend is running and reachable.`;
}

export function ActivityContextProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActivities = useCallback(async () => {
        if (!user?.id) {
            setActivities([]);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setActivities(await getActivityLogsByUser(user.id));
        } catch (err) {
            setError(getApiErrorMessage(err, "Failed to fetch activity logs."));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const fetchActivityById = async (id: number): Promise<ActivityLog | null> => {
        try {
            return await getActivityLogById(id);
        } catch {
            return null;
        }
    };

    // Logging is best effort: a log failure must not undo a successful user action.
    const logActivity = async (action: string, description: string, taskId?: number | null) => {
        if (!user?.id) return;
        try {
            const activity = await createActivityLog({
                user_id: user.id,
                task_id: taskId ?? null,
                action,
                description,
            });
            setActivities((current) => [activity, ...current]);
        } catch (err) {
            console.error("Failed to record activity:", err);
        }
    };

    const removeActivity = async (id: number) => {
        try {
            setError(null);
            await deleteActivityLog(id);
            setActivities((current) => current.filter((activity) => activity.id !== id));
        } catch (err) {
            setError("Failed to delete activity log.");
            throw err;
        }
    };

    return (
        <ActivityContext.Provider value={{
            activities,
            loading,
            error,
            fetchActivities,
            fetchActivityById,
            logActivity,
            removeActivity,
        }}>
            {children}
        </ActivityContext.Provider>
    );
}

export function useActivity() {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error("useActivity must be used within ActivityContextProvider");
    }
    return context;
}
