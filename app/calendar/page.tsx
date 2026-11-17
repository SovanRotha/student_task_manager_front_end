"use client";

import { useEffect, useState } from "react";
import { useTask } from "../context/taskContext";
import type { Task } from "../model/task/task";
import Header from "../components/header";
import Link from "next/link";

function Calendar() {
    const { tasks, loading, error, fetchTasks } = useTask();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch tasks when the page loads
    useEffect(() => {
        void fetchTasks().catch(() => {});
    }, [fetchTasks]);

    // Format date as YYYY-MM-DD
    const getDateKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Get tasks for a particular date
    const getTasksByDate = (date: Date) => {
        const dateKey = getDateKey(date);
        return tasks.filter((task: Task) => {
            const dueDate = task.due_date ?? task.dueDate;
            if (!dueDate) return false;
            const matchesDate = String(dueDate).slice(0, 10) === dateKey;
            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = !query || task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query);
            return matchesDate && matchesSearch;
        });
    };

    // Generate 42 calendar days (Monday start to match the reference layout)
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Adjust getDay() so Monday = 0, Sunday = 6
        let startDay = firstDay.getDay() - 1;
        if (startDay === -1) startDay = 6;

        const totalDays = lastDay.getDate();
        const days: Date[] = [];

        // Previous month's days
        for (let i = 0; i < startDay; i++) {
            days.push(new Date(year, month, i - startDay + 1));
        }

        // Current month's days
        for (let i = 1; i <= totalDays; i++) {
            days.push(new Date(year, month, i));
        }

        // Next month's days to fill 42 cells (6 rows)
        while (days.length < 42) {
            const nextDay = days.length - startDay - totalDays + 1;
            days.push(new Date(year, month + 1, nextDay));
        }

        return days;
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    // Task status color matching reference pills
    const getStatusColor = (task: Task) => {
        const status = task.status;
        if (status === "completed") {
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        }
        if (status === "in_progress" || status === "in-progress") {
            return "bg-blue-50 text-blue-700 border-blue-200";
        }
        if (task.priority === "high") {
            return "bg-red-50 text-red-700 border-red-200";
        }
        return "bg-indigo-50 text-[#5145CD] border-indigo-100";
    };

    const getStatusLabel = (task: Task) => {
        if (task.status === "completed") return "Completed";
        if (task.status === "in_progress" || task.status === "in-progress") return "In Progress";
        if (task.priority === "high") return "High priority";
        return "Pending";
    };

    const calendarDays = generateCalendarDays();
    const selectedTasks = getTasksByDate(selectedDate);

    const monthName = currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const todayKey = getDateKey(new Date());
    const selectedKey = getDateKey(selectedDate);

    const completedCount = selectedTasks.filter((t) => t.status === "completed").length;
    const completionRate = selectedTasks.length > 0 ? Math.round((completedCount / selectedTasks.length) * 100) : 0;

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
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="font-jakarta text-3xl font-extrabold text-[#1E293B]">Task Calendar</h1>
                        <p className="mt-1 text-sm text-slate-500">View tasks by due date.</p>
                    </div>
                    <Link href="/task" className="inline-flex items-center justify-center rounded-xl bg-[#5145CD] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#5145CD]/20 transition hover:bg-[#6C63FF]">Add task</Link>
                </div>

                {/* Main Content Grid: Calendar Grid on Left, Selected Day Detail on Right */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Calendar Navigation & Grid */}
                    <div className="xl:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
                        
                        {/* Month Navigator & Category Filter Pills */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <h2 className="font-jakarta text-2xl font-bold text-[#1E293B]">
                                    {monthName}
                                </h2>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={previousMonth}
                                        className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        &lt;
                                    </button>
                                    <button
                                        onClick={nextMonth}
                                        className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        &gt;
                                    </button>
                                    <button
                                        onClick={goToToday}
                                        className="ml-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        Today
                                    </button>
                                </div>
                            </div>

                            <div className="text-xs font-semibold text-slate-400 bg-indigo-50/60 px-3 py-1.5 rounded-xl text-[#5145CD]">
                                {tasks.filter((task) => task.due_date ?? task.dueDate).length} tasks with due dates
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs" aria-label="Task statuses">
                            {[
                                ["bg-emerald-500", "Completed"],
                                ["bg-blue-500", "In progress"],
                                ["bg-indigo-500", "Pending"],
                            ].map(([color, label]) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                                    <span className="font-medium text-slate-600">{label}</span>
                                </div>
                            ))}
                        </div>

                        {loading ? (
                            <div className="py-24 text-center text-slate-400">Loading calendar...</div>
                        ) : error ? (
                            <div className="py-24 text-center text-red-500">{error}</div>
                        ) : (
                            <div className="space-y-2">
                                {/* Weekday Headers (Monday Start) */}
                                <div className="grid grid-cols-7 border-b border-slate-100 pb-2">
                                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                        <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid (6 rows x 7 days = 42 cells) */}
                                <div className="grid grid-cols-7 gap-1.5">
                                    {calendarDays.map((date, index) => {
                                        const dateKey = getDateKey(date);
                                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                                        const isToday = dateKey === todayKey;
                                        const isSelected = dateKey === selectedKey;
                                        const dayTasks = getTasksByDate(date);

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedDate(date)}
                                                className={`min-h-[110px] rounded-2xl p-2 text-left transition-all border flex flex-col justify-between cursor-pointer ${
                                                    isSelected
                                                        ? "bg-indigo-50/70 border-[#6C63FF] shadow-xs"
                                                        : isToday
                                                        ? "bg-white border-[#5145CD]/40 ring-2 ring-[#5145CD]/10"
                                                        : isCurrentMonth
                                                        ? "bg-white border-slate-100 hover:border-slate-200"
                                                        : "bg-slate-50/50 border-transparent text-slate-300"
                                                }`}
                                            >
                                                {/* Date Number Badge */}
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            isToday
                                                                ? "bg-[#5145CD] text-white"
                                                                : isSelected
                                                                ? "bg-indigo-100 text-[#5145CD]"
                                                                : isCurrentMonth
                                                                ? "text-[#1E293B]"
                                                                : "text-slate-400"
                                                        }`}
                                                    >
                                                        {date.getDate()}
                                                    </span>
                                                    {isToday && (
                                                        <span className="text-[9px] font-bold text-[#5145CD] uppercase">Today</span>
                                                    )}
                                                </div>

                                                {/* Tasks inside cell */}
                                                <div className="space-y-1 mt-1 overflow-hidden">
                                                    {dayTasks.slice(0, 2).map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className={`w-full rounded-lg px-2 py-1 text-[10px] font-semibold truncate border ${getStatusColor(
                                                                task
                                                            )}`}
                                                        >
                                                            {task.title}
                                                        </div>
                                                    ))}
                                                    {dayTasks.length > 2 && (
                                                        <span className="text-[10px] font-bold text-[#5145CD] pl-1 block">
                                                            +{dayTasks.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Selected Day Detail Panel matching reference image[cite: 8] */}
                    <div className="xl:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                        
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Day Detail</span>
                                <h3 className="font-jakarta font-bold text-lg text-[#1E293B]">
                                    {selectedDate.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </h3>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                {selectedKey === todayKey ? "Today" : "Selected day"}
                            </span>
                        </div>

                        {/* Task Completion Rate Widget */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-600">Task Completion Rate</span>
                                <span className="font-bold text-[#5145CD]">{completedCount} of {selectedTasks.length} Tasks Done ({completionRate}%)</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#6C63FF] h-full rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
                            </div>
                        </div>

                        {/* Selected Tasks List */}
                        <div className="space-y-3">
                            {selectedTasks.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    No tasks scheduled for this date.
                                </div>
                            ) : (
                                selectedTasks.map((task) => {
                                    return (
                                        <div
                                            key={task.id}
                                            className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-all space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-[#5145CD] uppercase">
                                                    {task.priority === "high" ? "High priority" : "Task"}
                                                </span>
                                                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${getStatusColor(task)}`}>
                                                    {getStatusLabel(task)}
                                                </span>
                                            </div>

                                            <h4 className="font-jakarta font-bold text-sm text-[#1E293B]">
                                                {task.title}
                                            </h4>

                                            <p className="text-xs text-slate-500">
                                                {task.description || "No description provided."}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>

                </div>

            </div>
        </main>
    );
}

export default Calendar;
