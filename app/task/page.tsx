"use client";

import { useEffect, useState, useMemo } from "react";
import { useTask } from "../context/taskContext";
import { useCategory } from "../context/categoryContext";
import type { Task } from "../model/task/task";

import Header from "../components/header";
import AddTaskModal from "./components/addTask";
import EditTaskModal from "./components/editTask";

function TaskPage() {
    const {
        tasks,
        loading,
        error,
        fetchTasks,
        editTask,
        removeTask,
    } = useTask();
    const { categories, fetchCategories } = useCategory();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    // Filters, Search, and Sorting State matching the reference UI
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "pending" | "completed" | "overdue">("all");
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
    const [selectedPriorityFilter, setSelectedPriorityFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"deadline" | "priority" | "title">("deadline");

    // Fetch tasks
    useEffect(() => {
        void fetchTasks().catch(() => undefined);
        void fetchCategories().catch(() => undefined);
    }, [fetchTasks, fetchCategories]);

    // Open edit modal / side panel preview
    const handleEdit = (task: Task) => {
        setSelectedTask(task);
        setShowEditModal(true);
    };

    // Close edit modal
    const handleCloseEdit = () => {
        setShowEditModal(false);
        setSelectedTask(null);
    };

    // Delete task
    const handleDelete = async (id: number) => {
        const confirmed = window.confirm("Are you sure you want to delete this task?");
        if (!confirmed) return;

        try {
            await removeTask(id);
            if (selectedTask?.id === id) {
                handleCloseEdit();
            }
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    };

    // Helper to get due date across schema variations
    const getTaskDateVal = (task: Task) => task.due_date ?? task.dueDate ?? null;

    // Computed Counts & Filtered Tasks
    const counts = useMemo(() => {
        const total = tasks.length;
        const inProgress = tasks.filter((t) => t.status === "in_progress" || t.status === "in-progress").length;
        const pending = tasks.filter((t) => t.status === "pending").length;
        const completed = tasks.filter((t) => t.status === "completed").length;
        const overdue = tasks.filter((t) => {
            const d = getTaskDateVal(t);
            return d && new Date(d) < new Date() && t.status !== "completed";
        }).length;
        return { total, inProgress, pending, completed, overdue };
    }, [tasks]);

    // Filtered and Sorted Tasks List
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const q = searchQuery.trim().toLowerCase();
            if (q) {
                const matchTitle = task.title.toLowerCase().includes(q);
                const matchDesc = task.description?.toLowerCase().includes(q) ?? false;
                if (!matchTitle && !matchDesc) return false;
            }

            if (activeTab === "in_progress" && task.status !== "in_progress" && task.status !== "in-progress") return false;
            if (activeTab === "pending" && task.status !== "pending") return false;
            if (activeTab === "completed" && task.status !== "completed") return false;
            if (activeTab === "overdue") {
                const d = getTaskDateVal(task);
                const isOverdue = d && new Date(d) < new Date() && task.status !== "completed";
                if (!isOverdue) return false;
            }

            if (selectedCategoryFilter !== "all") {
                const categoryId = task.category_id ?? task.categoryId ?? task.category?.id;
                if (String(categoryId) !== selectedCategoryFilter) return false;
            }

            if (selectedPriorityFilter !== "all" && task.priority !== selectedPriorityFilter) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === "deadline") {
                const dateA = getTaskDateVal(a) ? new Date(getTaskDateVal(a)!).getTime() : Infinity;
                const dateB = getTaskDateVal(b) ? new Date(getTaskDateVal(b)!).getTime() : Infinity;
                return dateA - dateB;
            }
            if (sortBy === "priority") {
                const rank: Record<string, number> = { high: 1, medium: 2, low: 3 };
                return (rank[a.priority] || 4) - (rank[b.priority] || 4);
            }
            return a.title.localeCompare(b.title);
        });
    }, [tasks, searchQuery, activeTab, selectedCategoryFilter, selectedPriorityFilter, sortBy]);

    // Top priority task for top right banner widget
    const topPriorityTask = useMemo(() => {
        const active = tasks.filter((t) => t.status !== "completed");
        const high = active.find((t) => t.priority === "high");
        return high || active[0] || tasks[0];
    }, [tasks]);

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-50 text-red-700 border border-red-100";
            case "medium":
                return "bg-amber-50 text-amber-700 border border-amber-100";
            case "low":
                return "bg-emerald-50 text-emerald-700 border border-emerald-100";
            default:
                return "bg-slate-50 text-slate-700 border border-slate-100";
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#1E293B] pb-12 font-inter">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            {/* Header Component with Live Search */}
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <section className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Total tasks", value: counts.total },
                            { label: "In progress", value: counts.inProgress },
                            { label: "Completed", value: counts.completed },
                        ].map((item) => (
                            <article key={item.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                                <p className="mt-2 text-3xl font-extrabold text-[#1E293B]">{item.value}</p>
                            </article>
                        ))}
                    </section>
                    <section className="lg:col-span-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Open task</p>
                        {topPriorityTask ? (
                            <>
                                <h2 className="mt-2 line-clamp-2 font-bold text-[#1E293B]">{topPriorityTask.title}</h2>
                                <p className="mt-1 text-xs text-slate-500">{topPriorityTask.priority ? `${topPriorityTask.priority} priority ` : ""}{getTaskDateVal(topPriorityTask) ? new Date(getTaskDateVal(topPriorityTask)!).toLocaleString() : "No due date"}</p>
                                <button type="button" onClick={() => handleEdit(topPriorityTask)} className="mt-4 text-xs font-semibold text-[#5145CD] hover:underline">Open task</button>
                            </>
                        ) : <p className="mt-2 text-sm text-slate-500">No open tasks.</p>}
                    </section>
                </div>

                {/* Main Task Management Section */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Left/Main Task Table Area */}
                    <div className={`space-y-6 ${selectedTask ? 'xl:col-span-8' : 'xl:col-span-12'} transition-all`}>
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
                            
                            {/* Header & Create Button */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="font-jakarta text-2xl font-extrabold text-[#1E293B]">My Tasks</h1>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                            {counts.total} total tasks
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Tasks loaded from your account.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#5145CD] hover:bg-[#6C63FF] text-white text-xs font-semibold px-5 py-3 shadow-md shadow-[#5145CD]/20 transition-all cursor-pointer shrink-0"
                                >
                                    <span>+ Create Task</span>
                                </button>
                            </div>

                            {/* Filter Tabs & Dropdowns */}
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                                <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                    {[
                                        { id: "all", label: `All (${counts.total})` },
                                        { id: "in_progress", label: `In Progress (${counts.inProgress})` },
                                        { id: "pending", label: `Pending (${counts.pending})` },
                                        { id: "completed", label: `Completed (${counts.completed})` },
                                        { id: "overdue", label: `Overdue (${counts.overdue})`, alert: counts.overdue > 0 },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                                                activeTab === tab.id
                                                    ? "bg-white text-[#5145CD] shadow-xs border border-slate-200/60"
                                                    : "text-slate-500 hover:text-[#1E293B]"
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                            {tab.alert && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                    <select
                                        value={selectedCategoryFilter}
                                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-slate-600 outline-none focus:border-[#6C63FF]"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
                                    </select>

                                    <select
                                        value={selectedPriorityFilter}
                                        onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-slate-600 outline-none focus:border-[#6C63FF]"
                                    >
                                        <option value="all">All Priorities</option>
                                        <option value="high">High Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="low">Low Priority</option>
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-slate-600 outline-none focus:border-[#6C63FF]"
                                    >
                                        <option value="deadline">Sort by: Deadline (Soonest)</option>
                                        <option value="priority">Sort by: Priority (High → Low)</option>
                                        <option value="title">Sort by: Title (A → Z)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Task Table */}
                            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            <th className="py-3 px-4 w-12 text-center">Status</th>
                                            <th className="py-3 px-4">Title & Description</th>
                                            <th className="py-3 px-4">Category</th>
                                            <th className="py-3 px-4">Priority</th>
                                            <th className="py-3 px-4">Due Date</th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                                    Loading tasks...
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-red-500">
                                                    {error}
                                                </td>
                                            </tr>
                                        ) : filteredTasks.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                                    No tasks found matching your filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTasks.map((task) => {
                                                const dueDateVal = getTaskDateVal(task);
                                                const categoryName = task.category?.name || categories.find((category) => category.id === (task.category_id ?? task.categoryId))?.name || "Uncategorized";
                                                const isSelected = selectedTask?.id === task.id;

                                                return (
                                                    <tr
                                                        key={task.id}
                                                        onClick={() => handleEdit(task)}
                                                        className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${
                                                            isSelected ? 'bg-indigo-50/50' : ''
                                                        }`}
                                                    >
                                                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                checked={task.status === "completed"}
                                                                onChange={() => void editTask(task.id, { status: task.status === "completed" ? "pending" : "completed" }).catch((err) => console.error("Failed to update task status:", err))}
                                                                className="w-4 h-4 rounded border-slate-300 text-[#5145CD] focus:ring-[#6C63FF] cursor-pointer"
                                                            />
                                                        </td>

                                                        <td className="py-4 px-4 max-w-xs">
                                                            <div>
                                                                <span className="font-semibold text-[#1E293B] block truncate">
                                                                    {task.title}
                                                                </span>
                                                                <span className="text-xs text-slate-400 block truncate mt-0.5">
                                                                    {task.description || "No description provided"}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="py-4 px-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 text-[#5145CD]">
                                                                ● {categoryName}
                                                            </span>
                                                        </td>

                                                        <td className="py-4 px-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${getPriorityStyle(task.priority)}`}>
                                                                {task.priority} priority
                                                            </span>
                                                        </td>

                                                        <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-slate-600">
                                                            {dueDateVal ? new Date(dueDateVal).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "No deadline"}
                                                        </td>

                                                        <td className="py-4 px-4 whitespace-nowrap text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => handleEdit(task)}
                                                                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(task.id)}
                                                                className="px-3 py-1.5 rounded-xl border border-red-100 bg-red-50 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>

                    {/* Right Side Panel: Task Detail & Edit matching reference image[cite: 7] */}
                    {selectedTask && (
                        <div className="xl:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6 sticky top-24">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]"></span>
                                    <h3 className="font-jakarta font-bold text-sm text-[#1E293B]">TASK DETAIL & EDIT</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCloseEdit}
                                        className="text-slate-400 hover:text-[#1E293B] p-1 rounded-lg hover:bg-slate-100"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        Task Title
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedTask.title}
                                        readOnly
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1E293B] outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        Category
                                    </label>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#5145CD] flex items-center justify-between">
                                        <span>● {selectedTask.category?.name || categories.find((category) => category.id === (selectedTask.category_id ?? selectedTask.categoryId))?.name || "Uncategorized"}</span>
                                        <span>▼</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        Markdown Description
                                    </label>
                                    <textarea
                                        value={selectedTask.description || "No description provided."}
                                        readOnly
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 outline-none resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        Priority Tier
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                                        {["low", "medium", "high"].map((p) => (
                                            <div
                                                key={p}
                                                className={`py-2 rounded-xl text-center border capitalize ${
                                                    selectedTask.priority === p
                                                        ? 'bg-red-50 text-red-700 border-red-200 shadow-xs'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                            Due Date
                                        </label>
                                        <input
                                            type="text"
                                            value={getTaskDateVal(selectedTask) ? new Date(getTaskDateVal(selectedTask)!).toLocaleString() : "No deadline"}
                                            readOnly
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                            Status
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedTask.status.replaceAll("_", " ")}
                                            readOnly
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold capitalize text-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between gap-3">
                                    <button
                                        onClick={() => {
                                            setShowEditModal(true);
                                        }}
                                        className="w-full bg-[#5145CD] hover:bg-[#6C63FF] text-white py-3 rounded-xl font-jakarta font-semibold text-xs shadow-md shadow-[#5145CD]/20 transition-all cursor-pointer"
                                    >
                                        Open Full Editor Modal
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>

            {/* Modals */}
            <AddTaskModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />

            <EditTaskModal
                isOpen={showEditModal}
                onClose={handleCloseEdit}
                task={selectedTask}
            />
        </main>
    );
}

export default TaskPage;
