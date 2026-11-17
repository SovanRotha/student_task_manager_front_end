"use client";

import { useEffect, useState, useMemo } from "react";
import { useCategory } from "../context/categoryContext";
import { useTask } from "../context/taskContext";
import type { Category } from "../model/category/category";
import Header from "../components/header";
import AddCategory from "./components/addCategory";
import EditCategory from "./components/editCategory";

function CategoryPage() {
    const {
        categories,
        loading,
        error,
        fetchCategories,
        removeCategory,
    } = useCategory();
    const { tasks, fetchTasks } = useTask();

    const [showAdd, setShowAdd] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        void fetchCategories().catch(() => undefined);
        void fetchTasks().catch(() => undefined);
    }, [fetchCategories, fetchTasks]);

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this category?")) {
            return;
        }

        try {
            await removeCategory(id);
        } catch (err) {
            console.error("Failed to delete category:", err);
        }
    };

    const handleClose = () => {
        setShowAdd(false);
        setSelectedCategory(null);
    };

    // Filter categories based on search input
    const filteredCategories = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter(
            (cat) =>
                cat.name.toLowerCase().includes(q) ||
                (cat.description && cat.description.toLowerCase().includes(q))
        );
    }, [categories, searchQuery]);

    // Count API tasks by category for the distribution chart
    const taskDistribution = useMemo(() => {
        const totalTasks = tasks.length;
        if (categories.length === 0) return [];

        // Color-coded distribution based on the tasks assigned to each category
        const palette = ["#5145CD", "#3B82F6", "#10B981", "#6C63FF", "#F59E0B", "#EF4444"];
        let offset = 0;
        const radius = 52;
        const circumference = 2 * Math.PI * radius;

        return categories.map((cat, index) => {
            const taskCount = tasks.filter((task) => String(task.category_id ?? task.categoryId ?? task.category?.id) === String(cat.id)).length;
            const weight = totalTasks ? Math.round((taskCount / totalTasks) * 100) : 0;
            const dash = (weight / 100) * circumference;
            const item = {
                ...cat,
                taskCount,
                percentage: weight,
                color: palette[index % palette.length],
                dashArray: `${dash} ${circumference - dash}`,
                dashOffset: -offset,
            };
            offset += dash;
            return item;
        });
    }, [categories, tasks]);

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#1E293B] pb-12 font-inter">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            {/* Top Navigation Header */}
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
                
                {/* Page Title & Banner Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-[#5145CD] bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                            Curriculum Taxonomy
                        </span>
                        <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-[#1E293B] mt-2">
                            Course & Category Management
                        </h1>
                        <p className="text-sm text-slate-500 max-w-2xl">
                            Create categories and see how many tasks are assigned to each one.
                        </p>
                    </div>

                    {!showAdd && !selectedCategory && (
                        <button
                            onClick={() => setShowAdd(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#5145CD] hover:bg-[#6C63FF] text-white text-xs font-semibold px-5 py-3 shadow-md shadow-[#5145CD]/20 transition-all cursor-pointer shrink-0"
                        >
                            <span>+ New Category</span>
                        </button>
                    )}
                </div>

                {/* Modals for Add / Edit */}
                {showAdd && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <AddCategory onCancel={handleClose} />
                    </div>
                )}

                {selectedCategory && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <EditCategory key={selectedCategory.id} category={selectedCategory} onCancel={handleClose} />
                    </div>
                )}

                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</p>
                        <p className="mt-2 text-3xl font-extrabold text-[#1E293B]">{categories.length}</p>
                    </article>
                    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tasks</p>
                        <p className="mt-2 text-3xl font-extrabold text-[#1E293B]">{tasks.length}</p>
                    </article>
                </section>

                {/* Categories and task counts */}
                {/* Main Content Split: Categories and API-backed task counts */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: List of Categories */}
                    <div className="xl:col-span-8 space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="font-jakarta font-bold text-lg text-[#1E293B]">
                                All Categories ({filteredCategories.length})
                            </h2>
                        </div>

                        {loading ? (
                            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm">
                                Loading categories...
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm">
                                {error}
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm">
                                {searchQuery ? `No categories found matching "${searchQuery}".` : "No categories found."}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredCategories.map((category) => (
                                    <article
                                        key={category.id}
                                        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all space-y-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-jakarta font-bold text-lg text-[#1E293B]">
                                                        {category.name}
                                                    </h3>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    {category.description || "No description provided."}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => {
                                                        setShowAdd(false);
                                                        setSelectedCategory(category);
                                                    }}
                                                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                                    title="Edit Category"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                                    title="Delete Category"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                                            {tasks.filter((task) => String(task.category_id ?? task.categoryId ?? task.category?.id) === String(category.id)).length} tasks in this category
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Tasks by category & Curriculum Tip matching reference */}
                    <div className="xl:col-span-4 space-y-6">
                        
                        {/* Tasks by category Donut Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-jakarta font-bold text-lg text-[#1E293B]">Tasks by category</h3>
                                <span className="text-xs text-slate-400 font-medium">Task count</span>
                            </div>

                            <div className="flex items-center justify-center py-2">
                                <div className="relative w-36 h-36 flex items-center justify-center">
                                    <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="52"
                                            fill="transparent"
                                            stroke="#F1F5F9"
                                            strokeWidth="12"
                                        />
                                        {taskDistribution.map((item) => (
                                            <circle
                                                key={item.id}
                                                cx="64"
                                                cy="64"
                                                r="52"
                                                fill="transparent"
                                                stroke={item.color}
                                                strokeWidth="12"
                                                strokeDasharray={item.dashArray}
                                                strokeDashoffset={item.dashOffset}
                                                strokeLinecap="round"
                                            />
                                        ))}
                                    </svg>
                                    <div className="absolute text-center">
                                        <span className="font-jakarta font-extrabold text-xl text-[#1E293B]">
                                            {tasks.length}
                                        </span>
                                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Tasks
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                {taskDistribution.map((cat) => (
                                    <div key={cat.id} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                                            <span className="font-medium text-slate-600 truncate">{cat.name}</span>
                                        </div>
                                        <span className="font-bold text-[#1E293B] shrink-0">{cat.taskCount} tasks · {cat.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </main>
    );
}

export default CategoryPage;
