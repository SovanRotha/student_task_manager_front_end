"use client";

import { useEffect, useState, useMemo } from "react";
import { useActivity } from "../context/activityContext";
import Header from "../components/header";

export default function ActivityPage() {
    const { activities, loading, error, fetchActivities, removeActivity } = useActivity();
    
    // UI state inspired by the Klaris Academic OS audit trail design
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | "created" | "updated" | "deleted">("all");

    useEffect(() => {
        void fetchActivities().catch((err) => {
            console.error("Failed to load activity:", err);
        });
    }, [fetchActivities]);

    // Filter and search activities
    const filteredActivities = useMemo(() => {
        return activities.filter((activity) => {
            const q = searchQuery.trim().toLowerCase();
            if (q) {
                const matchAction = activity.action.toLowerCase().includes(q);
                const matchDesc = activity.description.toLowerCase().includes(q);
                if (!matchAction && !matchDesc) return false;
            }

            if (filterType !== "all") {
                if (!activity.action.toLowerCase().includes(filterType)) return false;
            }

            return true;
        });
    }, [activities, searchQuery, filterType]);

    // Statistics counts
    const stats = useMemo(() => {
        const total = activities.length;
        const creations = activities.filter((a) => a.action.toLowerCase().includes("creat") || a.action.toLowerCase().includes("add")).length;
        const updates = activities.filter((a) => a.action.toLowerCase().includes("updat")).length;
        return { total, creations, updates };
    }, [activities]);

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
                
                {/* Top Banner Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <span>WORKSPACE</span>
                            <span>/</span>
                            <span className="text-[#5145CD]">AUDIT TRAIL</span>
                        </div>
                        <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
                            Activity & System Audit Log
                        </h1>
                        <p className="text-sm text-slate-500 max-w-2xl">
                            Review recorded actions from your tasks, categories, and notifications.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => void fetchActivities().catch((err) => console.error("Failed to refresh activity:", err))}
                            disabled={loading}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Syncing…" : "Refresh Log"}
                        </button>
                    </div>
                </div>

                {/* Quick Statistics Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <article className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Log Entries</span>
                            <p className="font-jakarta text-3xl font-extrabold text-[#1E293B] mt-1">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5145CD] flex items-center justify-center font-bold">
                            📜
                        </div>
                    </article>

                    <article className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Updates</span>
                            <p className="font-jakarta text-3xl font-extrabold text-[#1E293B] mt-1">{stats.updates}</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            ✓
                        </div>
                    </article>

                    <article className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Creations</span>
                            <p className="font-jakarta text-3xl font-extrabold text-[#1E293B] mt-1">{stats.creations}</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            ⚡
                        </div>
                    </article>
                </div>

                {error && (
                    <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">
                        {error}
                    </div>
                )}

                {/* Main Activity Feed Container */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
                    
                    {/* Filter Tabs & Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            {[
                                { id: "all", label: `All Activity (${activities.length})` },
                                { id: "created", label: "Creations" },
                                { id: "updated", label: "Updates" },
                                { id: "deleted", label: "Deletions" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterType(tab.id as typeof filterType)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        filterType === tab.id
                                            ? "bg-white text-[#5145CD] shadow-xs border border-slate-200/60"
                                            : "text-slate-500 hover:text-[#1E293B]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <span className="text-xs font-medium text-slate-400">
                            Showing {filteredActivities.length} events
                        </span>
                    </div>

                    {/* Activity Feed List */}
                    {loading && activities.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            Loading activity trail…
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            {searchQuery ? `No activity matching "${searchQuery}".` : "No activity recorded yet."}
                        </div>
                    ) : (
                        <ol className="divide-y divide-slate-100">
                            {filteredActivities.map((activity) => (
                                <li key={activity.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors p-3 rounded-2xl">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#5145CD] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                                            ●
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-semibold text-sm text-[#1E293B] capitalize">
                                                    {activity.action.replaceAll("_", " ")}
                                                </p>
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                                    Audit Log
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600">{activity.description}</p>
                                            <time className="block text-[11px] text-slate-400 font-medium pt-0.5" dateTime={activity.created_at}>
                                                {new Date(activity.created_at).toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </time>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => void removeActivity(activity.id).catch((err) => console.error("Failed to delete activity:", err))}
                                        className="shrink-0 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                        aria-label={`Delete activity: ${activity.description}`}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>

            </div>
        </main>
    );
}
