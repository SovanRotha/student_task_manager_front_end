"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTask } from "../../context/taskContext";
import { useCategory } from "../../context/categoryContext";
import { useAuth } from "../../context/authContext";
import type { Task } from "../../model/task/task";

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
    const { addTask } = useTask();
    const { categories, fetchCategories } = useCategory();
    const { user } = useAuth();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && categories.length === 0) {
            void fetchCategories().catch(() => setError("Could not load categories. Please try again."));
        }
    }, [isOpen, categories.length, fetchCategories]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category_id: "",
        priority: "medium",
        status: "pending",
        due_date: "",
        time: "17:00",
    });

    if (!isOpen) return null;

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            category_id: "",
            priority: "medium",
            status: "pending",
            due_date: "",
            time: "17:00",
        });
        setError(null);
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.title.trim().length < 2) {
            setError("Task title must be at least 2 characters.");
            return;
        }

        if (!user?.id) {
            setError("Your user session is unavailable. Please sign in again.");
            return;
        }

        if (!formData.category_id) {
            setError(categories.length ? "Choose a category for this task." : "Create a category before adding a task.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const combinedDueDate = formData.due_date 
                ? `${formData.due_date}T${formData.time || "17:00"}:00` 
                : null;

            const taskData = {
                user_id: user.id,
                title: formData.title.trim(),
                description: formData.description,
                category_id: Number(formData.category_id),
                priority: formData.priority,
                status: formData.status,
                due_date: combinedDueDate,
            };

            await addTask(
                taskData as Omit<Task, "id" | "createdAt" | "updatedAt">
            );

            resetForm();
            onClose();
        } catch (err) {
            console.error("Failed to create task:", err);
            setError("Failed to create task. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-inter backdrop-blur-xs"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) handleClose();
            }}
        >
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
                
                <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="font-jakarta text-lg font-bold text-[#1E293B]">New task</h2>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <form id="add-task-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
                    
                    <div>
                        <h2 className="font-jakarta text-2xl font-extrabold text-[#1E293B]">
                            Create task
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Add a task to your workspace.
                        </p>
                    </div>

                    {/* Task Title */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Task Title <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[11px] text-slate-400 font-medium">{formData.title.length}/120</span>
                        </div>

                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. CS302: Implement Distributed Hash Table (Chord DHT)"
                            required
                            maxLength={120}
                            minLength={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-[#1E293B] outline-none focus:border-[#6C63FF] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Course Module & Category */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Course Module & Category
                            </label>
                            <Link href="/category" className="text-xs font-semibold text-[#5145CD] hover:underline">+ Add Category</Link>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => {
                                const isSelected = formData.category_id === String(cat.id);
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, category_id: String(cat.id) }))}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                            isSelected
                                                ? 'bg-[#5145CD] text-white border-[#5145CD] shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>●</span>
                                        <span>{cat.name}</span>
                                    </button>
                                );
                            })}
                            {categories.length === 0 && <p className="text-sm text-slate-500">{error || "No categories yet. Add one from the Category page first."}</p>}
                        </div>
                    </div>

                    {/* Priority Tier & Initial Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Priority
                                </label>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "low", label: "Low", color: "hover:bg-slate-100" },
                                    { id: "medium", label: "Medium", color: "hover:bg-slate-100" },
                                    { id: "high", label: "High !", color: "bg-red-50 text-red-700 border-red-200 font-bold" },
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, priority: p.id }))}
                                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                                            formData.priority === p.id
                                                ? p.id === 'high' ? 'bg-red-500 text-white border-red-500 shadow-xs' : 'bg-[#5145CD] text-white border-[#5145CD]'
                                                : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                                Initial Status
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "pending", label: "Pending" },
                                    { id: "in_progress", label: "In Progress" },
                                ].map((st) => (
                                    <button
                                        key={st.id}
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, status: st.id }))}
                                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                                            formData.status === st.id
                                                ? 'bg-[#5145CD] text-white border-[#5145CD] shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}
                                    >
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Due Date & Deliverable Cut-Off */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                            Due date
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="date"
                                name="due_date"
                                value={formData.due_date}
                                onChange={handleChange}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#6C63FF]"
                            />
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-[#6C63FF]"
                            />
                        </div>

                    </div>

                    {/* Description & Deliverables Checklist */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                Description
                            </label>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">


                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Add deliverables, LaTeX proofs, GitHub repo link, or grading criteria specifics..."
                                rows={4}
                                className="w-full bg-transparent text-xs text-[#1E293B] outline-none resize-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
                    )}

                </form>

                {/* Footer Controls matching reference[cite: 10] */}
                <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>

                    <button
                        type="submit"
                        form="add-task-form"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5145CD] hover:bg-[#6C63FF] text-white text-xs font-semibold shadow-md shadow-[#5145CD]/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <span>{submitting ? "Creating..." : "Create Task"}</span>
                            </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AddTaskModal;
