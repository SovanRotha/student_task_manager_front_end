
"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";

import type { Category } from "../model/category/category";
import { useActivity } from "./activityContext";
import { useAuth } from "./authContext";

import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../service/category/category";

interface CategoryContextType {
    categories: Category[];
    loading: boolean;
    error: string | null;

    fetchCategories: () => Promise<void>;
    fetchCategoryById: (id: number) => Promise<Category | null>;
    addCategory: (
        category: Omit<Category, "id" | "created_at" | "updated_at">
    ) => Promise<Category>;
    editCategory: (
        id: number,
        category: Partial<Omit<Category, "id" | "created_at" | "updated_at">>
    ) => Promise<Category>;
    removeCategory: (id: number) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
    undefined
);

export function CategoryContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { logActivity } = useActivity();
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get all categories
    const fetchCategories = useCallback(async () => {
        if (!user?.id) {
            setCategories([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await getCategories(user.id);
            setCategories(data);
        } catch (err) {
            setError("Failed to fetch categories.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Get category by ID
    const fetchCategoryById = async (
        id: number
    ): Promise<Category | null> => {
        if (!user?.id) return null;
        return await getCategoryById(id, user.id);
    };

    // Create category
    const addCategory = async (
        category: Omit<Category, "id" | "created_at" | "updated_at">
    ): Promise<Category> => {
        try {
            if (!user?.id || Number(category.user_id) !== user.id) {
                throw new Error("Cannot create a category for another user.");
            }
            setError(null);

            const newCategory = await createCategory(category);

            setCategories((prev) => [...prev, newCategory]);
            await logActivity("category_created", `Created category "${newCategory.name}"`);

            return newCategory;
        } catch (err) {
            setError("Failed to create category.");
            throw err;
        }
    };

    // Update category
    const editCategory = async (
        id: number,
        category: Partial<Omit<Category, "id" | "created_at" | "updated_at">>
    ): Promise<Category> => {
        try {
            if (!user?.id || !categories.some((item) => item.id === id && Number(item.user_id) === user.id)) {
                throw new Error("Category does not belong to the current user.");
            }
            setError(null);

            const updatedCategory = await updateCategory(id, category);

            setCategories((prev) =>
                prev.map((item) =>
                    item.id === id ? updatedCategory : item
                )
            );
            await logActivity("category_updated", `Updated category "${updatedCategory.name}"`);

            return updatedCategory;
        } catch (err) {
            setError("Failed to update category.");
            throw err;
        }
    };

    // Delete category
    const removeCategory = async (id: number): Promise<void> => {
        try {
            if (!user?.id || !categories.some((item) => item.id === id && Number(item.user_id) === user.id)) {
                throw new Error("Category does not belong to the current user.");
            }
            setError(null);

            const deletedCategory = categories.find((item) => item.id === id);
            await deleteCategory(id);

            setCategories((prev) =>
                prev.filter((item) => item.id !== id)
            );
            await logActivity("category_deleted", `Deleted category "${deletedCategory?.name ?? id}"`);
        } catch (err) {
            setError("Failed to delete category.");
            throw err;
        }
    };

    return (
        <CategoryContext.Provider
            value={{
                categories,
                loading,
                error,
                fetchCategories,
                fetchCategoryById,
                addCategory,
                editCategory,
                removeCategory,
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
}

// Custom hook
export function useCategory() {
    const context = useContext(CategoryContext);

    if (!context) {
        throw new Error(
            "useCategory must be used within CategoryContextProvider"
        );
    }

    return context;
}
