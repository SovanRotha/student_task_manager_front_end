export interface Notification {
    id: number;
    user_id: number;
    task_id?: number | null;
    message: string;
    is_read: boolean;
    title?: string | null;
    type?: string | null;
    read_at?: string | null;
    created_at: string;
    updated_at?: string | null;
}
