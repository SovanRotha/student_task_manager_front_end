
"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

import type { Task } from "../model/task/task";
import { useActivity } from "./activityContext";

import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from "../service/task/task";

interface TaskContextType {
    tasks: Task[];
    loading: boolean;
    error: string | null;

    fetchTasks: () => Promise<void>;
    fetchTaskById: (id: number) => Promise<Task | null>;
    addTask: (
        task: Omit<Task, "id" | "createdAt" | "updatedAt">
    ) => Promise<Task>;
    editTask: (
        id: number,
        task: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>
    ) => Promise<Task | null>;
    removeTask: (id: number) => Promise<boolean>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { logActivity } = useActivity();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all tasks
    const fetchTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getAllTasks();
            setTasks(data);
        } catch (err) {
            setError("Failed to fetch tasks.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch task by ID
    const fetchTaskById = async (id: number): Promise<Task | null> => {
        return await getTaskById(id);
    };

    // Create task
    const addTask = async (
        task: Omit<Task, "id" | "createdAt" | "updatedAt">
    ): Promise<Task> => {
        try {
            setError(null);

            const newTask = await createTask(task);

            setTasks((prev) => [...prev, newTask]);
            await logActivity("task_created", `Created task "${newTask.title}"`, newTask.id);

            return newTask;
        } catch (err) {
            setError("Failed to create task.");
            throw err;
        }
    };

    // Update task
    const editTask = async (
        id: number,
        task: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>
    ): Promise<Task | null> => {
        try {
            setError(null);

            const updatedTask = await updateTask(id, task);

            if (!updatedTask) {
                setError("Failed to update task.");
                return null;
            }

            setTasks((prev) =>
                prev.map((item) =>
                    item.id === id ? updatedTask : item
                )
            );
            await logActivity("task_updated", `Updated task "${updatedTask.title}"`, id);

            return updatedTask;
        } catch (err) {
            setError("Failed to update task.");
            throw err;
        }
    };

    // Delete task
    const removeTask = async (id: number): Promise<boolean> => {
        try {
            setError(null);

            const success = await deleteTask(id);

            if (!success) {
                setError("Failed to delete task.");
                return false;
            }

            const deletedTask = tasks.find((task) => task.id === id);

            setTasks((prev) =>
                prev.filter((item) => item.id !== id)
            );
            await logActivity("task_deleted", `Deleted task "${deletedTask?.title ?? id}"`);

            return true;
        } catch (err) {
            setError("Failed to delete task.");
            throw err;
        }
    };

    return (
        <TaskContext.Provider
            value={{
                tasks,
                loading,
                error,
                fetchTasks,
                fetchTaskById,
                addTask,
                editTask,
                removeTask,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}

// Custom hook
export function useTask() {
    const context = useContext(TaskContext);

    if (!context) {
        throw new Error(
            "useTask must be used within TaskContextProvider"
        );
    }

    return context;
}
