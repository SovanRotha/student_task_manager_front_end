"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

const publicPaths = new Set(["/", "/register"]);

export default function AuthGate({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isPublicPath = publicPaths.has(pathname);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && !isPublicPath) {
            router.replace("/");
        } else if (isAuthenticated && isPublicPath) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isLoading, isPublicPath, router]);

    if (isLoading) return null;
    if (!isAuthenticated && !isPublicPath) return null;
    if (isAuthenticated && isPublicPath) return null;

    return children;
}
