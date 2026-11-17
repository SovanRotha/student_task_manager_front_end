
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthContextProvider } from "./context/authContext";
import { SidebarContextProvider } from "./context/sidebarContext";
import Sidebar from "./components/sidebar";
import { CategoryContextProvider } from "./context/categoryContext";
import { TaskContextProvider } from "./context/taskContext";
import { NotificationContextProvider } from "./context/notificationContext";
import { ActivityContextProvider } from "./context/activityContext";
import { DashboardContextProvider } from "./context/dashboardContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Student Task Manager",
    description: "Manage your tasks efficiently",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="h-full overflow-hidden">
                <AuthContextProvider>
                    <ActivityContextProvider>
                        <DashboardContextProvider>
                            <NotificationContextProvider>
                                <SidebarContextProvider>
                                    <CategoryContextProvider>
                                        <TaskContextProvider>
                                        <div className="flex h-screen w-full overflow-hidden bg-white">

                                            {/* Shared Sidebar */}
                                            <Sidebar />

                                            {/* Main Content */}
                                            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

                                                <main className="min-h-0 flex-1 overflow-y-auto">
                                                    {children}
                                                </main>

                                            </div>
                                        </div>
                                        </TaskContextProvider>
                                    </CategoryContextProvider>
                                </SidebarContextProvider>
                            </NotificationContextProvider>
                        </DashboardContextProvider>
                    </ActivityContextProvider>
                </AuthContextProvider>
            </body>
        </html>
    );
}
