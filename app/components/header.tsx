"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";
import { useNotification } from "../context/notificationContext";
import { useSidebar } from "../context/sidebarContext";
import { Menu } from "lucide-react";
import AddTaskModal from "../task/components/addTask";

interface HeaderProps {
    searchQuery?: string;
    onSearchChange?: (value: string) => void;
    onNewTaskClick?: () => void;
}

function Header({
    searchQuery,
    onSearchChange,
    onNewTaskClick,
}: HeaderProps) {
    const router = useRouter();
    const { user } = useAuth();
    const { notifications, fetchNotifications } = useNotification();
    const { toggleSidebar } = useSidebar();
    const [internalSearch, setInternalSearch] = useState("");
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    useEffect(() => {
        if (user?.id && notifications.length === 0) void fetchNotifications().catch(() => undefined);
    }, [user?.id, notifications.length, fetchNotifications]);
    const unreadCount = notifications.filter((notification) => !notification.is_read).length;

    const currentSearch =
        searchQuery !== undefined ? searchQuery : internalSearch;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (onSearchChange) {
            onSearchChange(value);
        } else {
            setInternalSearch(value);
        }
    };

    const userInitials = user?.name
        ? user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : user?.email?.[0]?.toUpperCase() || "ST";

    return (
        <>
        <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 px-4 sm:px-6 py-3.5 text-[#1E293B]">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <button type="button" onClick={toggleSidebar} aria-label="Toggle navigation" className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"><Menu size={20} /></button>
                
                {/* Left: Soft Pill Search Input */}
                <div className="relative flex-1 max-w-xl">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={currentSearch}
                        onChange={handleSearchChange}
                        placeholder="Search tasks, assignments, notes..."
                        className="w-full bg-[#EEF2FF]/75 hover:bg-[#EEF2FF] focus:bg-white text-sm text-[#1E293B] placeholder:text-slate-400 rounded-xl pl-11 pr-4 py-2.5 border border-transparent focus:border-[#6C63FF]/40 focus:ring-4 focus:ring-[#6C63FF]/10 outline-none transition-all"
                    />
                </div>

                {/* Right: Notifications, Primary Action & Profile */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    
                    {/* Notification Bell */}
                    <button
                        type="button"
                        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                        onClick={() => router.push("/notification")}
                        className="relative p-2.5 rounded-xl text-slate-600 hover:text-[#1E293B] hover:bg-slate-100/80 transition-colors cursor-pointer"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 ring-2 ring-white text-[9px] text-white flex items-center justify-center">{unreadCount || ""}</span>
                        )}
                    </button>

                    {/* Primary Action Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsAddTaskOpen(true);
                            onNewTaskClick?.();
                        }}
                        className="inline-flex items-center gap-2 bg-[#5145CD] hover:bg-[#6C63FF] active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-[#5145CD]/25 transition-all cursor-pointer"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                            />
                        </svg>
                        <span>New Task</span>
                    </button>

                    {/* User Avatar */}
                    <button
                        type="button"
                        aria-label="User Profile"
                        className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 hover:ring-2 hover:ring-[#6C63FF]/30 transition-all flex items-center justify-center bg-[#6C63FF]/10 text-[#5145CD] font-semibold text-xs cursor-pointer"
                    >
                        {user?.profile ? (
                            <img
                                src={user.profile}
                                alt={user.name || "User avatar"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span>{userInitials}</span>
                        )}
                    </button>

                </div>
            </div>
        </header>
        <AddTaskModal isOpen={isAddTaskOpen} onClose={() => setIsAddTaskOpen(false)} />
        </>
    );
}

export default Header;
