
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/sidebarContext";
import { useAuth } from "../context/authContext";

import {
    LayoutDashboard,
    ClipboardList,
    CalendarDays,
    Tags,
    Bell,
    Activity,
    LogOut,
    X,
    ListTodo,
} from "lucide-react";

const menuItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "My Tasks",
        href: "/task",
        icon: ClipboardList,
    },
    {
        name: "Calendar",
        href: "/calendar",
        icon: CalendarDays,
    },
    {
        name: "Category",
        href: "/category",
        icon: Tags,
    },
    {
        name: "Notification",
        href: "/notification",
        icon: Bell,
        // badge: 3,
    },
    {
        name: "Activity Log",
        href: "/activity",
        icon: Activity,
    },
];

function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
    const { user, logout } = useAuth();

    // The root route is the login screen, so it should use the full viewport.
    if (pathname === "/" || pathname === "/login" || pathname === "/register") {
        return null;
    }

    const handleNavigation = () => {
        if (window.matchMedia("(max-width: 767px)").matches) {
            closeSidebar();
        }
    };

    const handleLogout = () => {
        logout();
        closeSidebar();
        router.push("/");
    };

    return (
        <>
            {isOpen && (
                <>
                    <div
                        onClick={closeSidebar}
                        className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    />

                    <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200/80 bg-gradient-to-b from-white via-white to-indigo-50/40 px-4 py-5 shadow-xl shadow-slate-900/5 md:sticky md:z-20 md:shadow-none">
                        <div className="mb-8 flex items-center justify-between rounded-2xl bg-white/80 px-3 py-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#5145CD] text-white shadow-md shadow-indigo-500/20">
                                    <ListTodo size={21} />
                                </div>

                                <div>
                                    <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                                        TaskFlow
                                    </h1>
                                    <p className="text-[11px] text-slate-500">
                                        Student Task Manager
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={toggleSidebar}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1">
                            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                Workspace
                            </p>

                            <nav className="space-y-1.5">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                        pathname === item.href ||
                                        pathname.startsWith(item.href + "/");

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={handleNavigation}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                                                isActive
                                                    ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-[#5145CD] shadow-sm ring-1 ring-indigo-100"
                                                    : "text-slate-600 hover:bg-white hover:text-slate-950 hover:shadow-sm"
                                            }`}
                                        >
                                            <Icon size={20} />

                                            <span className="flex-1">{item.name}</span>

                                            {/* {item.badge && (
                                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs text-white">
                                                    {item.badge}
                                                </span>
                                            )} */}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 font-bold text-[#5145CD]">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-slate-900">
                                        {user?.name || "Student"}
                                    </p>

                                    <p className="truncate text-xs text-slate-500">
                                        {user?.email || "Student Account"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </aside>
                </>
            )}

        </>
    );
}

export default Sidebar;
