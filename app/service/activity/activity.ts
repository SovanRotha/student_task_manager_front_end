import Api from "../Api/api";
import type { ActivityLog, ActivityLogCreate } from "../../model/activity/activity";

export async function getActivityLogs(): Promise<ActivityLog[]> {
    const response = await Api.get<ActivityLog[]>("/activity-logs/");
    return response.data;
}

export async function getActivityLogsByUser(userId: number): Promise<ActivityLog[]> {
    const response = await Api.get<ActivityLog[]>(`/activity-logs/user/${userId}`);
    return response.data;
}

export async function getActivityLogById(id: number): Promise<ActivityLog> {
    const response = await Api.get<ActivityLog>(`/activity-logs/${id}`);
    return response.data;
}

export async function createActivityLog(activity: ActivityLogCreate): Promise<ActivityLog> {
    const response = await Api.post<ActivityLog>("/activity-logs/", activity);
    return response.data;
}

export async function deleteActivityLog(id: number): Promise<void> {
    await Api.delete(`/activity-logs/${id}`);
}
