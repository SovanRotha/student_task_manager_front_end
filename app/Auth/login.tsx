"use client";

import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

function Login() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(email, password);
            router.push("/dashboard");
        } catch (error: unknown) {
            const responseError = error as { response?: { data?: { detail?: string } } };
            setError(responseError.response?.data?.detail || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EEF2FF]/60 p-4 sm:p-8 text-[#1E293B]">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

                .font-jakarta {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                .font-inter {
                    font-family: 'Inter', sans-serif;
                }
            `}</style>

            <div className="font-inter w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Card: Focused Student Login */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(30,41,59,0.04)] border border-slate-100 flex flex-col justify-between">
                    <div>
                        {/* App Brand */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#5145CD] flex items-center justify-center text-white shadow-md shadow-[#6C63FF]/25">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-jakarta font-bold text-lg tracking-tight text-[#1E293B]">
                                        TaskFlow
                                    </span>
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#6C63FF]/10 text-[#5145CD]">
                                        STUDENT
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">Personal Academic Workspace</p>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="font-jakarta text-3xl sm:text-4xl font-extrabold text-[#1E293B] tracking-tight mb-2">
                                Welcome back
                            </h1>
                            <p className="text-sm text-slate-500">
                                Log in to manage your assignments, deadlines, and daily study tasks.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-[#1E293B] mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@student.edu"
                                        required
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#1E293B] placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold text-[#1E293B]">
                                        Password
                                    </label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-medium text-[#5145CD] hover:text-[#6C63FF] transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm text-[#1E293B] placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#6C63FF] focus:ring-4 focus:ring-[#6C63FF]/10 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#1E293B] transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-xl">
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#6C63FF] hover:bg-[#5145CD] active:scale-[0.99] text-white py-3.5 rounded-xl font-jakarta font-semibold text-sm shadow-lg shadow-[#6C63FF]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span>{loading ? "Signing in..." : "Sign In"}</span>
                                {!loading && (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span>
                            New to Student Task Manager?{" "}
                            <Link href="/register" className="font-semibold text-[#5145CD] hover:text-[#6C63FF]">
                                Create an account
                            </Link>
                        </span>
                    </div>
                </div>

                <aside className="hidden lg:flex lg:col-span-5 flex-col justify-center rounded-3xl border border-[#6C63FF]/10 bg-[#E0E7FF]/50 p-8">
                    <span className="mb-5 inline-flex w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#5145CD] shadow-xs">Student Task Manager</span>
                    <h2 className="font-jakarta mb-3 text-2xl font-bold leading-snug text-[#1E293B]">Your coursework, in one place.</h2>
                    <p className="mb-7 text-sm leading-relaxed text-slate-600">Manage tasks, organize them by category, and review your notifications and activity.</p>
                    <ul className="space-y-3 text-sm font-medium text-slate-700">
                        <li className="rounded-xl border border-white bg-white/80 p-3">Tasks with due dates and status</li>
                        <li className="rounded-xl border border-white bg-white/80 p-3">Categories for organizing your work</li>
                        <li className="rounded-xl border border-white bg-white/80 p-3">Notifications and activity history</li>
                    </ul>
                </aside>

            </div>
        </div>
    );
}

export default Login;
