"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/authContext";

export default function Register() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const signedIn = await register(name.trim(), email.trim(), password);
            router.push(signedIn ? "/dashboard" : "/");
        } catch (err) {
            const response = err as { response?: { data?: { detail?: unknown } }; message?: string };
            const detail = response.response?.data?.detail;
            setError(typeof detail === "string" ? detail : response.message || "Could not create your account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#EEF2FF]/60 px-4 py-10 text-[#1E293B] flex items-center justify-center">
            <section className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-indigo-900/5 sm:p-10">
                <Link href="/" className="mb-8 inline-flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#5145CD] text-lg font-bold text-white">✓</span>
                    <span><strong className="block text-lg">TaskFlow</strong><span className="text-xs text-slate-500">Student Task Manager</span></span>
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
                <p className="mt-2 text-sm text-slate-500">Set up your workspace and keep your coursework organized.</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block text-sm font-semibold">Full name
                        <input autoComplete="name" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-[#6C63FF] focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="Your name" />
                    </label>
                    <label className="block text-sm font-semibold">Email address
                        <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-[#6C63FF] focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="you@example.com" />
                    </label>
                    <label className="block text-sm font-semibold">Password
                        <input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-[#6C63FF] focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="At least 8 characters" />
                    </label>
                    <label className="block text-sm font-semibold">Confirm password
                        <input type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-[#6C63FF] focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="Re-enter your password" />
                    </label>
                    {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                    <button disabled={loading} className="w-full rounded-xl bg-[#5145CD] px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#4338B8] disabled:cursor-not-allowed disabled:opacity-60">
                        {loading ? "Creating account…" : "Create account"}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/" className="font-semibold text-[#5145CD] hover:underline">Sign in</Link></p>
            </section>
        </main>
    );
}
