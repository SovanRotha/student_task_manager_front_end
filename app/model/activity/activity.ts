export interface ActivityLog {
    id: number;
    user_id: number;
    task_id: number | null;
    action: string;
    description: string;
    created_at: string;
}

export interface ActivityLogCreate {
    user_id: number;
    task_id?: number | null;
    action: string;
    description: string;
}
