export interface Task {
    id: number;
    user_id?: number;
    userId?: number;
    category_id?: number;
    categoryId?: number;
    title: string;
    description: string;
    due_date?: string | null;
    dueDate?: string | null;
    category?: { id: number; name: string };
    priority?: string;
    status: "pending" | "in_progress" | "in-progress" | "completed";
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TaskService {
    getAllTasks(): Promise<Task[]>;
    getTaskById(id: number): Promise<Task | null>;
    createTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task>;
    updateTask(id: number, task: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | null>;
    deleteTask(id: number): Promise<boolean>;
}
