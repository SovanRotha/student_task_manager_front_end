import Api from "../../service/Api/api";
import type { Task } from "../../model/task/task";

export const getAllTasks = async (userId: number): Promise<Task[]> => {
    try {
        const response = await Api.get("/tasks", { params: { user_id: userId } });
        const tasks = response.data as Task[];

        // Keep the visible task list scoped to the signed-in user even if the
        // API returns a broader collection. Ownership must be attached to each task.
        return tasks.filter((task) => Number(task.user_id ?? task.userId) === userId);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
};

export const getTaskById = async (id: number): Promise<Task | null> => {
    try {
        const response = await Api.get(`/tasks/${id}`);
        return response.data as Task;
    } catch (error) {
        console.error(`Error fetching task with id ${id}:`, error);
        return null;
    }
};

export const createTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
    try {
        const response = await Api.post("/tasks", task);
        return response.data as Task;
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
};

export const updateTask = async (id: number, task: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>): Promise<Task | null> => {
    try {
        const response = await Api.put(`/tasks/${id}`, task);
        return response.data as Task;
    } catch (error) {
        console.error(`Error updating task with id ${id}:`, error);
        return null;
    }
};

export const deleteTask = async (id: number): Promise<boolean> => {
    try {
        await Api.delete(`/tasks/${id}`);
        return true;
    } catch (error) {
        console.error(`Error deleting task with id ${id}:`, error);
        return false;
    }
};


