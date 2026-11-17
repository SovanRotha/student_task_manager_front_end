import type { ActivityLog } from "../activity/activity";
import type { Task } from "../task/task";

export interface DashboardData {
    statistics: {
        total_users: number;
        total_tasks: number;
        total_categories: number;
    };
    task_status: {
        in_progress: number;
        completed: number;
        pending: number;
        overdue: number;
    };
    upcoming_tasks: Task[];
    today_tasks: Task[];
    upcoming_deadline_tasks: Task[];
    recent_activities: ActivityLog[];
}
