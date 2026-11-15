
"use client";

import type { ReactNode } from "react";
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

function Sidebar({ children }: { children?: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
    const { user, logout } = useAuth();

    const handleNavigation = () => {
        if (window.matchMedia("(max-width: 767px)").matches) {
            closeSidebar();
        }
    };

    const handleLogout = () => {
        logout();
        closeSidebar();
        router.push("/login");
    };

    return (
        <div className="min-h-screen">
            {isOpen && (
                <>
                    <div
                        onClick={closeSidebar}
                        className="fixed inset-0 z-40 bg-black/40 md:hidden"
                    />

                    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white px-4 py-6 md:sticky md:z-20">
                        <div className="mb-10 flex items-center justify-between px-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                                    <ListTodo size={21} />
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">
                                        TaskFlow
                                    </h1>
                                    <p className="text-xs text-gray-400">
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
                            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Workspace
                            </p>

                            <nav className="space-y-1">
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
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                            <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-800">
                                        {user?.name || "Student"}
                                    </p>

                                    <p className="truncate text-xs text-gray-500">
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

            <main className={isOpen ? "md:ml-64" : ""}>{children}</main>
        </div>
    );
}

export default Sidebar;
