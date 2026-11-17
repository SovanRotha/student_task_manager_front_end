"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import type { Notification } from "../model/notification/notification";
import { useActivity } from "./activityContext";
import {
    createNotification,
    deleteNotification,
    getNotificationById,
    getNotifications,
    updateNotification,
    type NotificationCreate,
    type NotificationUpdate,
} from "../service/notification/notification";

interface NotificationContextValue {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    fetchNotificationById: (id: number) => Promise<Notification | null>;
    addNotification: (notification: NotificationCreate) => Promise<Notification>;
    editNotification: (id: number, notification: NotificationUpdate) => Promise<Notification>;
    removeNotification: (id: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationContextProvider({ children }: { children: ReactNode }) {
    const { logActivity } = useActivity();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setNotifications(await getNotifications());
        } catch (err) {
            setError("Failed to fetch notifications.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchNotificationById = async (id: number): Promise<Notification | null> => {
        try {
            return await getNotificationById(id);
        } catch {
            return null;
        }
    };

    const addNotification = async (notification: NotificationCreate) => {
        try {
            setError(null);
            const created = await createNotification(notification);
            setNotifications((current) => [created, ...current]);
            await logActivity("notification_created", `Created notification "${created.title || created.message}"`, created.task_id);
            return created;
        } catch (err) {
            setError("Failed to create notification.");
            throw err;
        }
    };

    const editNotification = async (id: number, notification: NotificationUpdate) => {
        try {
            setError(null);
            const updated = await updateNotification(id, notification);
            setNotifications((current) => current.map((item) => item.id === id ? updated : item));
            await logActivity("notification_updated", `Updated notification "${updated.title || updated.message}"`, updated.task_id);
            return updated;
        } catch (err) {
            setError("Failed to update notification.");
            throw err;
        }
    };

    const removeNotification = async (id: number) => {
        try {
            setError(null);
            const deletedNotification = notifications.find((item) => item.id === id);
            await deleteNotification(id);
            setNotifications((current) => current.filter((item) => item.id !== id));
            await logActivity("notification_deleted", `Deleted notification "${deletedNotification?.title ?? id}"`, deletedNotification?.task_id);
        } catch (err) {
            setError("Failed to delete notification.");
            throw err;
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            loading,
            error,
            fetchNotifications,
            fetchNotificationById,
            addNotification,
            editNotification,
            removeNotification,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within NotificationContextProvider");
    }
    return context;
}
