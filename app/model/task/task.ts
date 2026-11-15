export interface Task {
    id: number;
    userId: number;
    categoryId: number;
    title: string;
    description: string;
    dueDate: string;
    status: "pending" | "in-progress" | "completed";
    createdAt: string;
    updatedAt: string;
}
