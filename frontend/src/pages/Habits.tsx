
import { useState } from 'react';
import { Plus, Flame, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export function Habits() {
    const { habits, createHabit, toggleHabit, isLoading } = useData();
    const [newHabitTitle, setNewHabitTitle] = useState('');

    // ... (imports)

    // Helper to check if a date string array contains today
    const isCompletedToday = (dates: string[]) => {
        const today = new Date().toDateString();
        return dates.some(d => new Date(d).toDateString() === today);
    };

    // ... (component start)

    const handleCreateHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHabitTitle.trim()) return;

        try {
            await createHabit({ title: newHabitTitle, frequency: 7 });
            setNewHabitTitle('');
        } catch (error) {
            console.error('Failed to create habit', error);
        }
    };

    const handleCheckIn = async (id: string, currentlyCompleted: boolean) => {
        if (currentlyCompleted) return; // Prevent double check-in for now or allow toggle? API supports toggle.
        try {
            await toggleHabit(id);
        } catch (error) {
            console.error('Failed to check in', error);
        }
    };

    // ... (render)

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Habit Tracker</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Build consistency, one day at a time.</p>
                </div>

                <form onSubmit={handleCreateHabit} className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        placeholder="New habit..."
                        className="px-4 py-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] min-w-[200px]"
                    />
                    <button
                        type="submit"
                        disabled={!newHabitTitle.trim()}
                        className="btn-primary whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Add Habit
                    </button>
                </form>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-[var(--text-tertiary)]">Loading habits...</div>
            ) : habits.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-[var(--border-subtle)] rounded-xl">
                    <Flame size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                    <h3 className="text-lg font-medium text-[var(--text-secondary)]">No habits yet</h3>
                    <p className="text-[var(--text-tertiary)]">Start tracking a new habit above!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map(habit => (
                        <div key={habit.id} className="card-modern p-6 relative group overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Flame size={80} />
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <h3 className="font-semibold text-lg text-[var(--text-primary)]">{habit.title}</h3>
                                    <p className="text-xs text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
                                        <Calendar size={12} />
                                        Daily Goal
                                    </p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className={`text-2xl font-bold ${habit.streak > 0 ? 'text-orange-500' : 'text-[var(--text-tertiary)]'}`}>
                                        {habit.streak}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">Streak</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between relative z-10 w-full">
                                <div className="flex gap-1">
                                    {/* Mini heat map visualization (last 5 days) */}
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() - (4 - i));
                                        const dateStr = d.toDateString();
                                        // Robust verification: check if dateStr is in completedDates (after normalizing them)
                                        const isDone = habit.completedDates.some(completedDate => new Date(completedDate).toDateString() === dateStr);

                                        return (
                                            <div
                                                key={i}
                                                className={`w-3 h-8 rounded-full border border-[var(--border-subtle)] transition-colors ${isDone
                                                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                                                    : 'bg-[var(--bg-surface-3)] opacity-30'
                                                    }`}
                                                title={dateStr}
                                            />
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handleCheckIn(habit.id, isCompletedToday(habit.completedDates))}
                                    disabled={isCompletedToday(habit.completedDates)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                                        ${isCompletedToday(habit.completedDates)
                                            ? 'bg-green-500/20 text-green-500 cursor-default shadow-none'
                                            : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                        }
                                    `}
                                >
                                    {isCompletedToday(habit.completedDates) ? (
                                        <>
                                            <CheckCircle2 size={18} />
                                            <span>Done</span>
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp size={18} />
                                            <span>Check In</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
