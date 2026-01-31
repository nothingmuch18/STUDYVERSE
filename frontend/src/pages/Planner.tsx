import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../lib/api';
import { TaskModal, type Task } from '../components/tasks/TaskModal';
import { aiApi } from '../lib/api';

export function Planner() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const getWeekDays = (date: Date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(start);
            day.setDate(day.getDate() + i);
            return day;
        });
    };

    const weekDays = getWeekDays(currentDate);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null);

    const handleSlotClick = (date: Date, hour: number) => {
        // Create a date object with the specific time
        const slotDate = new Date(date);
        slotDate.setHours(hour, 0, 0, 0);

        setSelectedSlot({ date: slotDate, hour });
        setIsModalOpen(true);
    };

    const { data: tasks, refetch: refetchTasks } = useQuery<Task[]>({
        queryKey: ['planner-tasks'],
        queryFn: async () => {
            const res = await tasksApi.getAll();
            return res.data;
        },
        initialData: [],
    });

    const handleTaskCreated = async () => {
        await refetchTasks();
        setIsModalOpen(false);
        setSelectedSlot(null); // Keep this to clear the selected slot after creation
    };

    // RENDER LOGIC
    // We need to render tasks onto the grid.
    // Simple logic: iterate time slots and days, find task that matches.
    const getTaskForSlot = (day: Date, hour: number): Task | undefined => {
        return tasks.find((t: Task) => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d.getDate() === day.getDate() &&
                d.getMonth() === day.getMonth() &&
                d.getFullYear() === day.getFullYear() &&
                d.getHours() === hour;
        });
    };

    return (
        <div className="p-8 h-[calc(100vh-theme(spacing.20))] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Study Planner</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Click any slot to schedule a session</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={async () => {
                            // Simple MVP Auto-Schedule Trigger
                            const goal = prompt("What is your main goal for this week?");
                            if (!goal) return;

                            try {
                                alert("AI is crafting your plan... This might take a few seconds.");
                                await aiApi.getStudyPlan({ goal, availableHours: 10 });
                                alert("Plan generated! Check your Dashboard Insights.");
                            } catch (e) {
                                alert("Failed to generate plan.");
                            }
                        }}
                        className="btn-primary bg-gradient-brand border-none text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <Sparkles size={18} className="mr-2" />
                        Auto-Schedule with AI
                    </button>

                    <div className="flex items-center gap-4 bg-[var(--bg-surface-1)] p-1 rounded-lg border border-[var(--border-subtle)]">
                        <button onClick={handlePrevWeek} className="p-2 hover:bg-[var(--bg-surface-2)] rounded-md text-[var(--text-secondary)]">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 px-2 font-medium text-[var(--text-primary)] min-w-[200px] justify-center">
                            <CalendarIcon size={18} className="text-[var(--accent-primary)]" />
                            <span>{weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</span>
                        </div>
                        <button onClick={handleNextWeek} className="p-2 hover:bg-[var(--bg-surface-2)] rounded-md text-[var(--text-secondary)]">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-surface-0)] shadow-sm">
                <div className="grid grid-cols-8 min-w-[1000px] divide-x divide-[var(--border-subtle)] h-full">
                    {/* Time Column */}
                    <div className="col-span-1 bg-[var(--bg-surface-1)]">
                        {/* ... */}
                        <div className="h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]"></div>
                        {timeSlots.map(time => (
                            <div key={time} className="h-20 border-b border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)] p-2 text-right font-mono">
                                {time}:00
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map((day, index) => (
                        <div key={index} className="col-span-1 flex flex-col">
                            {/* Day Header */}
                            <div className={`h - 12 border - b border - [var(--border - subtle)] flex flex - col items - center justify - center ${day.toDateString() === new Date().toDateString() ? 'bg-[var(--accent-primary)]/10' : 'bg-[var(--bg-surface-1)]'} `}>
                                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">{days[day.getDay()].slice(0, 3)}</span>
                                <span className={`text - sm font - bold ${day.toDateString() === new Date().toDateString() ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'} `}>
                                    {day.getDate()}
                                </span>
                            </div>

                            {/* Grid Slots */}
                            <div className="flex-1 relative">
                                {timeSlots.map(time => {
                                    const task = getTaskForSlot(day, time);
                                    return (
                                        <div
                                            key={time}
                                            onClick={() => handleSlotClick(day, time)}
                                            className={`
h - 20 border - b border - [var(--border - subtle)]transition - colors cursor - pointer group relative p - 1
                                            ${!task ? 'hover:bg-[var(--accent-primary)]/5' : ''}
`}
                                        >
                                            {!task ? (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none text-[var(--accent-primary)]">
                                                    <PlusIcon />
                                                </div>
                                            ) : (
                                                <div onClick={(e) => {
                                                    e.stopPropagation();
                                                    // handle edit click
                                                    // setSelectedSlot(...)
                                                    // setIsModalOpen(true)
                                                }}
                                                    className="h-full w-full rounded-md bg-[var(--accent-primary)]/20 border-l-2 border-[var(--accent-primary)] p-2 text-xs overflow-hidden">
                                                    <div className="font-semibold text-[var(--text-primary)] truncate">{task.title}</div>
                                                    <div className="text-[var(--text-secondary)] opacity-80">{task.subject}</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Task Modal Integration */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleTaskCreated}
                initialTask={undefined}
                initialDate={selectedSlot ? selectedSlot.date : undefined}
            />
        </div>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
