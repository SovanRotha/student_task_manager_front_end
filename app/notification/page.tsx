"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/authContext";
import { useNotification } from "../context/notificationContext";
import type { Notification } from "../model/notification/notification";
import Header from "../components/header";

export default function NotificationPage() {
    const { user } = useAuth();
    const {
        notifications,
        loading,
        error,
        fetchNotifications,
        addNotification,
        editNotification,
        removeNotification: removeNotificationFromContext,
    } = useNotification();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("general");
    const [taskId, setTaskId] = useState("");
    const [submitting, setSubmitting] = useState(false);
    
    // UI state inspired by Klaris Academic OS reference
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const pageError = error ?? (!user?.id ? "Your user session is unavailable. Please sign in again." : null);

    useEffect(() => {
        void fetchNotifications().catch((err) => {
            console.error("Failed to load notifications:", err);
        });
    }, [fetchNotifications]);

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user?.id) return;

        setSubmitting(true);
        try {
            await addNotification({
                user_id: user.id,
                title: title.trim(),
                message: message.trim(),
                type,
                task_id: taskId.trim() ? Number(taskId) : null,
            });
            setTitle("");
            setMessage("");
            setType("general");
            setTaskId("");
        } catch (err) {
            console.error("Failed to create notification:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleRead = async (notification: Notification) => {
        try {
            await editNotification(notification.id, {
                is_read: !notification.is_read,
            });
        } catch (err) {
            console.error("Failed to update notification:", err);
        }
    };

    const removeNotification = async (id: number) => {
        try {
            await removeNotificationFromContext(id);
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    // Filter & count stats
    const stats = useMemo(() => {
        const total = notifications.length;
        const unread = notifications.filter((n) => !n.is_read).length;
        const urgentOrDeadline = notifications.filter((n) => n.type?.toLowerCase().includes("urgent") || n.type?.toLowerCase().includes("deadline")).length;
        return { total, unread, urgentOrDeadline };
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        return notifications.filter((n) => {
            const q = searchQuery.trim().toLowerCase();
            if (q) {
                const matchTitle = n.title?.toLowerCase().includes(q) ?? false;
                const matchMsg = n.message?.toLowerCase().includes(q) ?? false;
                if (!matchTitle && !matchMsg) return false;
            }

            if (activeTab === "unread" && n.is_read) return false;
            if (activeTab === "deadlines" && !n.type?.toLowerCase().includes("deadline") && !n.type?.toLowerCase().includes("urgent")) return false;
            if (activeTab === "security" && !n.type?.toLowerCase().includes("security") && !n.type?.toLowerCase().includes("system")) return false;

            if (typeFilter !== "all") {
                if (typeFilter === "urgent" && !n.type?.toLowerCase().includes("urgent")) return false;
            }

            return true;
        });
    }, [notifications, searchQuery, activeTab, typeFilter]);

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-[#1E293B] pb-12 font-inter">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                .font-inter { font-family: 'Inter', sans-serif; }
            `}</style>

            {/* Header Component */}
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

            <div className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
                
                {/* Top Banner Section */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <span>WORKSPACE</span>
                            <span>/</span>
                            <span className="text-[#5145CD]">{user?.name || user?.email || "ACCOUNT"}</span>
                            <span>/</span>
                            <span>NOTIFICATIONS & AUDIT LOG</span>
                        </div>
                        <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
                            Notifications & Academic Activity
                        </h1>
                        <p className="text-sm text-slate-500 max-w-2xl">
                            Review, search, and manage notifications for your account.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            onClick={() => {
                                notifications.forEach((n) => {
                                    if (!n.is_read) void editNotification(n.id, { is_read: true });
                                });
                            }}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                        >
                            ✓ Mark All as Read
                        </button>
                    </div>
                </div>

                {/* Top Quick Status Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <article className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unread Alerts</span>
                            <p className="font-jakarta text-3xl font-extrabold text-[#1E293B] mt-1">{stats.unread}</p>
                            <p className="text-[11px] font-semibold text-red-600 mt-1">Action Required</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
                            !
                        </div>
                    </article>

                    <article className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urgent / Deadline type</span>
                            <p className="font-jakarta text-3xl font-extrabold text-[#1E293B] mt-1">{stats.urgentOrDeadline}</p>
                            <p className="text-[11px] font-semibold text-[#5145CD] mt-1">Based on notification type</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#5145CD] flex items-center justify-center font-bold">
                            ⏱
                        </div>
                    </article>

                    <article className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total notifications</span>
                            <p className="font-jakarta text-3xl font-extrabold text-[#1E293B] mt-1">{stats.total}</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">{stats.total}</div>
                    </article>
                </div>

                {/* Main Content Layout Split */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Notification Feed & Creation Form */}
                    <div className="xl:col-span-12 space-y-6">
                        
                        {/* Filter Tabs Bar */}
                        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-1">
                                {[
                                    { id: "all", label: `All (${notifications.length})` },
                                    { id: "unread", label: `Unread (${stats.unread})` },
                                    { id: "deadlines", label: "Deadlines & Due Dates" },
                                    { id: "security", label: "Security & System" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                            activeTab === tab.id
                                                ? "bg-[#5145CD] text-white shadow-xs"
                                                : "text-slate-600 hover:text-[#1E293B] hover:bg-slate-50"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 pr-2">
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600 outline-none"
                                >
                                    <option value="all">All types</option>
                                    <option value="urgent">Urgent only</option>
                                </select>
                            </div>
                        </div>

                        {/* Create Notification Form Card */}
                        <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                            <h2 className="font-jakarta text-lg font-bold text-[#1E293B]">Create Academic Notification</h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="notification-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Title</label>
                                    <input
                                        id="notification-title"
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        required
                                        minLength={2}
                                        placeholder="e.g. Assignment Graded"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#6C63FF]"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="notification-type" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Type / Category</label>
                                    <input
                                        id="notification-type"
                                        value={type}
                                        onChange={(event) => setType(event.target.value)}
                                        placeholder="general, urgent, deadline"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#6C63FF]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notification-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Message</label>
                                <textarea
                                    id="notification-message"
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    required
                                    minLength={2}
                                    rows={3}
                                    placeholder="Enter notification details..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-[#1E293B] outline-none focus:border-[#6C63FF] resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="notification-task" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Task ID (optional)</label>
                                    <input
                                        id="notification-task"
                                        type="number"
                                        min="1"
                                        value={taskId}
                                        onChange={(event) => setTaskId(event.target.value)}
                                        placeholder="e.g. 102"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#6C63FF]"
                                    />
                                </div>
                            </div>

                            {pageError && <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl">{pageError}</p>}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[#5145CD] hover:bg-[#6C63FF] text-white py-3 rounded-xl font-jakarta font-semibold text-xs shadow-md shadow-[#5145CD]/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {submitting ? "Creating Notification..." : "Create Notification"}
                            </button>
                        </form>

                        {/* Notifications Feed List */}
                        <div className="space-y-4">
                            <h2 className="font-jakarta text-lg font-bold text-[#1E293B] px-1">
                                Notification Feed ({filteredNotifications.length})
                            </h2>

                            {loading ? (
                                <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm">
                                    Loading notifications…
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm">
                                    No notifications found.
                                </div>
                            ) : (
                                filteredNotifications.map((notification) => (
                                    <article
                                        key={notification.id}
                                        className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                                            notification.is_read ? "opacity-75 bg-slate-50/50" : "border-l-4 border-l-[#5145CD]"
                                        }`}
                                    >
                                        <div className="space-y-2 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-jakarta font-bold text-base text-[#1E293B]">
                                                    {notification.title || "Notification"}
                                                </h3>
                                                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-[#5145CD] uppercase">
                                                    {notification.type || "general"}
                                                </span>
                                                {!notification.is_read && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                        New
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                {notification.message}
                                            </p>

                                            <time dateTime={notification.created_at} className="block text-xs text-slate-400 font-medium pt-1">
                                                {new Date(notification.created_at).toLocaleString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </time>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2 pt-2 sm:pt-0">
                                            <button
                                                type="button"
                                                onClick={() => void toggleRead(notification)}
                                                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                            >
                                                Mark {notification.is_read ? "unread" : "read"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void removeNotification(notification.id)}
                                                className="px-3.5 py-2 rounded-xl border border-red-100 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>

                    </div>

                </div>

            </div>
        </main>
    );
}
