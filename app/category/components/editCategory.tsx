"use client";

import { useState } from "react";
import { useCategory } from "../../context/categoryContext";
import type { Category } from "../../model/category/category";

interface EditCategoryProps {
    category: Category;
    onCancel: () => void;
}

function EditCategory({ category, onCancel }: EditCategoryProps) {
    const { editCategory } = useCategory();

    const [name, setName] = useState(category.name);
    const [description, setDescription] = useState(
        category.description ?? ""
    );
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) return;

        try {
            setSubmitting(true);
            setError(null);

            await editCategory(category.id, {
                name: name.trim(),
                description: description.trim(),
            });

            onCancel();
        } catch (err) {
            console.error("Failed to update category:", err);
            setError("Failed to update category. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 font-inter">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5145CD] bg-indigo-50 px-2.5 py-1 rounded-full">
                            Workspace Management
                        </span>
                        <h2 className="font-jakarta text-xl font-extrabold text-[#1E293B] mt-1">
                            Edit Category
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                        {error}
                    </div>
                )}

                {/* Category Name */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Category / Course Name <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">{name.length}/60</span>
                    </div>

                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter category name"
                        maxLength={60}
                        minLength={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-[#1E293B] outline-none focus:border-[#6C63FF] focus:bg-white transition-all"
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block">
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-[#1E293B] outline-none focus:border-[#6C63FF] focus:bg-white transition-all resize-none"
                        rows={3}
                    />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5145CD] hover:bg-[#6C63FF] text-white text-xs font-semibold shadow-md shadow-[#5145CD]/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <span>{submitting ? "Saving Changes..." : "Save Changes"}</span>
                        </button>
                </div>

            </form>
        </div>
    );
}

export default EditCategory;