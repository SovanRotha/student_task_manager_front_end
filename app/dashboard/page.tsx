"use client";

import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../context/dashboardContext";
import { useAuth } from "../context/authContext";
import type { Task } from "../model/task/task";
import Header from "../components/header";

function getTaskDate(task: Task) {
    return task.due_date ?? task.dueDate ?? null;
}

function formatDate(value?: string | null) {
    if (!value) return "No due date";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function DashboardPage() {
    const { dashboard, loading, error, fetchDashboard } = useDashboard();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        void fetchDashboard().catch(() => undefined);
    }, [fetchDashboard]);

    const filterTasks = (tasks: Task[] = []) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return tasks;
        return tasks.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                (t.description && t.description.toLowerCase().includes(q))
        );
    };

    // Summarize the API activity records by day for the last week.
    const weeklyActivity = useMemo(() => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const buckets = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            return {
                key: date.toISOString().slice(0, 10),
                day: i === 6 ? "Today" : days[date.getDay()],
                count: 0,
                isToday: i === 6,
            };
        });
        (dashboard?.recent_activities ?? []).forEach((activity) => {
            const key = new Date(activity.created_at).toISOString().slice(0, 10);
            const bucket = buckets.find((item) => item.key === key);
            if (bucket) bucket.count += 1;
        });
        return buckets;
    }, [dashboard]);

    const maxActivity = Math.max(...weeklyActivity.map((b) => b.count), 4);

    // Dynamic SVG donut ring segments from API task_status
    const statusBreakdown = useMemo(() => {
        const ts = dashboard?.task_status;
        const completed = ts?.completed ?? 0;
        const inProgress = ts?.in_progress ?? 0;
        const pending = ts?.pending ?? 0;
        const overdue = ts?.overdue ?? 0;
        const total = completed + inProgress + pending + overdue;

        const items = [
            { label: "Completed", count: completed, color: "#10B981", dot: "bg-emerald-500" },
            { label: "In Progress", count: inProgress, color: "#3B82F6", dot: "bg-blue-500" },
            { label: "Pending", count: pending, color: "#6C63FF", dot: "bg-[#6C63FF]" },
            { label: "Overdue", count: overdue, color: "#EF4444", dot: "bg-red-500" },
        ];

        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        let offset = 0;

        const segments = items.map((item) => {
            const pct = total > 0 ? item.count / total : 0;
            const dash = pct * circumference;
            const seg = {
                ...item,
                pct: Math.round(pct * 100),
                dashArray: `${dash} ${circumference - dash}`,
                dashOffset: -offset,
            };
            offset += dash;
            return seg;
        });

        return { total, segments, radius, circumference };
    }, [dashboard]);

    const getStatusBadgeStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("complet")) return "bg-emerald-50 text-emerald-700";
        if (s.includes("progress")) return "bg-blue-50 text-blue-700";
        if (s.includes("overdue")) return "bg-red-50 text-red-700";
        return "bg-indigo-50 text-[#5145CD]";
    };

    const renderTasksCard = (title: string, tasks: Task[], subtitle: string) => {
        const filtered = filterTasks(tasks);
        return (
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#6C63FF]"></span>
                            <h2 className="font-jakarta font-bold text-lg text-[#1E293B]">{title}</h2>
                        </div>
                        <span className="text-xs font-semibold text-[#5145CD] bg-indigo-50 px-2.5 py-1 rounded-full">
                            {filtered.length} {filtered.length === 1 ? "task" : "tasks"}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">{subtitle}</p>
                </div>

                {filtered.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                        {searchQuery ? `No tasks matching "${searchQuery}".` : "No tasks scheduled."}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((task) => {
                            const dueDateVal = getTaskDate(task);
                            const statusStr = String(task.status).replaceAll("_", " ").replaceAll("-", " ");
                            return (
                                <div
                                    key={task.id}
                                    className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-all flex items-start justify-between gap-3"
                                >
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md capitalize ${getStatusBadgeStyle(
                                                    statusStr
                                                )}`}
                                            >
                                                {statusStr}
                                            </span>
                                            {task.category?.name && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                                    {task.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-sm text-[#1E293B] truncate">
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p className="text-xs text-slate-500 line-clamp-1">
                                                {task.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-medium text-slate-500 block">
                                            {formatDate(dueDateVal)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        );
    };

    const stats = dashboard?.statistics;
    const taskStatus = dashboard?.task_status;
    const totalTasksCount = stats?.total_tasks ?? 0;
    const completedCount = taskStatus?.completed ?? 0;
    const completionPercentage =
        totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

    const displayName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#1E293B] pb-12 font-inter">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
                {/* Top Banner Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs font-semibold">
                            <span className="bg-indigo-50 text-[#5145CD] px-3 py-1 rounded-full">
                                {stats?.total_categories ?? 0} Active Categories
                            </span>
                            <span className="text-slate-400">
                                {new Date().toLocaleDateString(undefined, {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                        <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-[#1E293B] flex items-center gap-2">
                            Welcome back, {displayName}! <span>👋</span>
                        </h1>
                        <p className="text-sm text-slate-500 max-w-xl">
                            You&apos;ve completed{" "}
                            <strong className="text-[#5145CD]">{completionPercentage}%</strong> ({completedCount} of{" "}
                            {totalTasksCount}) of your total tasks.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => void fetchDashboard().catch(() => undefined)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5145CD] hover:bg-[#6C63FF] text-white text-xs font-semibold shadow-md shadow-[#5145CD]/20 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <span>{loading ? "Syncing..." : "Refresh"}</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => void fetchDashboard().catch(() => undefined)}
                            className="font-semibold underline cursor-pointer"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {loading && !dashboard ? (
                    <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-400">
                        Loading dashboard data…
                    </div>
                ) : dashboard ? (
                    <>
                        {/* API Metrics Cards Grid */}
                        <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                            {[
                                {
                                    label: "TOTAL TASKS",
                                    value: stats?.total_tasks ?? 0,
                                    badge: `${stats?.total_categories ?? 0} categories`,
                                    accent: "text-[#1E293B]",
                                    iconBg: "bg-indigo-50 text-[#5145CD]",
                                },
                                {
                                    label: "IN PROGRESS",
                                    value: taskStatus?.in_progress ?? 0,
                                    badge: "Tasks in progress",
                                    accent: "text-[#3B82F6]",
                                    iconBg: "bg-blue-50 text-[#3B82F6]",
                                },
                                {
                                    label: "COMPLETED",
                                    value: taskStatus?.completed ?? 0,
                                    badge: `${completionPercentage}% completion`,
                                    accent: "text-emerald-600",
                                    iconBg: "bg-emerald-50 text-emerald-600",
                                },
                                {
                                    label: "PENDING",
                                    value: taskStatus?.pending ?? 0,
                                    badge: `${dashboard.upcoming_tasks?.length ?? 0} upcoming`,
                                    accent: "text-[#6C63FF]",
                                    iconBg: "bg-indigo-50 text-[#6C63FF]",
                                },
                                {
                                    label: "OVERDUE",
                                    value: taskStatus?.overdue ?? 0,
                                    badge: (taskStatus?.overdue ?? 0) > 0 ? "needs action" : "all on track",
                                    accent: "text-red-600",
                                    iconBg: "bg-red-50 text-red-600",
                                    colSpan: "col-span-2 sm:col-span-1",
                                },
                            ].map((card) => (
                                <article
                                    key={card.label}
                                    className={`bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between ${
                                        card.colSpan || ""
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold tracking-wider text-slate-400">
                                            {card.label}
                                        </span>
                                        <span
                                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${card.iconBg}`}
                                        >
                                            ●
                                        </span>
                                    </div>
                                    <div>
                                        <p className={`font-jakarta text-3xl font-extrabold ${card.accent}`}>
                                            {card.value}
                                        </p>
                                        <p className="text-[11px] font-medium text-slate-400 mt-1">
                                            {card.badge}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </section>

                        {/* Middle Section: Weekly Activity & Status Distribution */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {/* 7-Day Activity Velocity from API */}
                            <div className="xl:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="font-jakarta font-bold text-lg text-[#1E293B]">
                                            Weekly Activity
                                        </h2>
                                        <p className="text-xs text-slate-400">
                                            Activity records from the last 7 days
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold text-[#5145CD] bg-indigo-50 px-3 py-1 rounded-full">
                                        {weeklyActivity.reduce((acc, b) => acc + b.count, 0)} events
                                    </span>
                                </div>

                                <div className="grid grid-cols-7 gap-3 items-end h-44 pt-6 px-2 border-b border-slate-100">
                                    {weeklyActivity.map((bar) => {
                                        const heightPct =
                                            bar.count > 0 ? Math.max((bar.count / maxActivity) * 100, 14) : 8;
                                        return (
                                            <div
                                                key={bar.key}
                                                className="flex flex-col items-center gap-2 h-full justify-end"
                                            >
                                                <span className="text-xs font-bold text-[#5145CD]">
                                                    {bar.count}
                                                </span>
                                                <div
                                                    className={`w-full max-w-[44px] rounded-t-xl transition-all ${
                                                        bar.isToday
                                                            ? "bg-[#6C63FF] shadow-md shadow-[#6C63FF]/30"
                                                            : bar.count > 0
                                                            ? "bg-[#5145CD]"
                                                            : "bg-slate-100"
                                                    }`}
                                                    style={{ height: `${heightPct}%` }}
                                                />
                                                <span className="text-[11px] font-medium text-slate-400 pb-1">
                                                    {bar.day}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <p className="pt-3 text-xs text-slate-400">Counts are based on the recent activity records returned by the dashboard API.</p>
                            </div>

                            {/* Dynamic SVG Donut Chart from API task_status */}
                            <div className="xl:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="font-jakarta font-bold text-lg text-[#1E293B]">
                                        Status Distribution
                                    </h2>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {statusBreakdown.total} Tasks
                                    </span>
                                </div>

                                <div className="flex items-center justify-center py-3">
                                    <div className="relative w-36 h-36 flex items-center justify-center">
                                        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r={statusBreakdown.radius}
                                                fill="transparent"
                                                stroke="#F1F5F9"
                                                strokeWidth="12"
                                            />
                                            {statusBreakdown.total > 0 &&
                                                statusBreakdown.segments.map((seg) =>
                                                    seg.count > 0 ? (
                                                        <circle
                                                            key={seg.label}
                                                            cx="64"
                                                            cy="64"
                                                            r={statusBreakdown.radius}
                                                            fill="transparent"
                                                            stroke={seg.color}
                                                            strokeWidth="12"
                                                            strokeDasharray={seg.dashArray}
                                                            strokeDashoffset={seg.dashOffset}
                                                            strokeLinecap="round"
                                                        />
                                                    ) : null
                                                )}
                                        </svg>
                                        <div className="absolute text-center">
                                            <span className="font-jakarta font-extrabold text-xl text-[#1E293B]">
                                                {completionPercentage}%
                                            </span>
                                            <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                Done
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-2">
                                    {statusBreakdown.segments.map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between text-xs"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                                                <span className="font-medium text-slate-600">{item.label}</span>
                                            </div>
                                            <span className="font-bold text-[#1E293B]">
                                                {item.pct}% ({item.count})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* API Task Lists */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {renderTasksCard(
                                "Today's Tasks",
                                dashboard.today_tasks,
                                "Tasks due or scheduled for today"
                            )}
                            {renderTasksCard(
                                "Upcoming Tasks",
                                dashboard.upcoming_tasks,
                                "Next tasks in your queue"
                            )}
                        </div>

                        {renderTasksCard(
                            "Upcoming Deadlines",
                            dashboard.upcoming_deadline_tasks,
                            "Approaching due dates requiring attention"
                        )}

                        {/* API Recent Activity Feed */}
                        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-jakarta font-bold text-lg text-[#1E293B]">
                                    Recent Activity
                                </h2>
                                <span className="text-xs text-slate-400">
                                    {dashboard.recent_activities.length} events
                                </span>
                            </div>

                            {dashboard.recent_activities.length === 0 ? (
                                <p className="py-8 text-sm text-slate-400 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                                    No recent activity recorded.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {dashboard.recent_activities.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-start justify-between gap-4"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-semibold text-sm text-[#1E293B] capitalize">
                                                    {activity.action.replaceAll("_", " ")}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <time
                                                dateTime={activity.created_at}
                                                className="text-xs text-slate-400 shrink-0 font-medium"
                                            >
                                                {formatDate(activity.created_at)}{" "}
                                                {new Date(activity.created_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </time>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                ) : null}
            </div>
        </main>
    );
}

export default DashboardPage;
