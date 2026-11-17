import Api from "../../service/Api/api";
import type { Category } from "../../model/category/category";


export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await Api.get('/categories');
        return response.data as Category[];
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
};

export const createCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
    try {
        const response = await Api.post('/categories', category);
        return response.data as Category;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const updateCategory = async (id: number, category: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category> => {
    try {
        const response = await Api.put(`/categories/${id}`, category);
        return response.data as Category;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

export const deleteCategory = async (id: number): Promise<void> => {
    try {
        await Api.delete(`/categories/${id}`);
    }
    catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
    try {
        const response = await Api.get(`/categories/${id}`);
        return response.data as Category;
    } catch (error) {
        console.error("Error fetching category by ID:", error);
        return null;
    }
};
