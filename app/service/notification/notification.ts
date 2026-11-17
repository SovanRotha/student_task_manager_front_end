import Api from "../Api/api";
import type { Notification } from "../../model/notification/notification";

export type NotificationCreate = Pick<Notification, "user_id" | "message"> & {
    task_id?: number | null;
    title: string;
    type: string;
};

export type NotificationUpdate = Partial<
    Pick<Notification, "message" | "title" | "type" | "task_id" | "is_read">
>;

export async function getNotifications(): Promise<Notification[]> {
    const response = await Api.get<Notification[]>("/notifications");
    return response.data;
}

export async function getNotificationById(id: number): Promise<Notification> {
    const response = await Api.get<Notification>(`/notifications/${id}`);
    return response.data;
}

export async function createNotification(
    notification: NotificationCreate
): Promise<Notification> {
    const response = await Api.post<Notification>("/notifications", notification);
    return response.data;
}

export async function updateNotification(
    id: number,
    notification: NotificationUpdate
): Promise<Notification> {
    const response = await Api.put<Notification>(`/notifications/${id}`, notification);
    return response.data;
}

export async function deleteNotification(id: number): Promise<void> {
    await Api.delete(`/notifications/${id}`);
}
