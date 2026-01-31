
import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { tasksApi } from '../../lib/api';

export interface Task {
    id: string;
    title: string;
    description?: string;
    subject?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    dueDate?: string; // ISO string
    isRecurring: boolean;
    recurrenceRule?: 'DAILY' | 'WEEKLY';
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    initialTask?: Task; // If provided, we are in EDIT mode
    initialDate?: Date;
}

export function TaskModal({ isOpen, onClose, onSave, initialTask, initialDate }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceRule, setRecurrenceRule] = useState('DAILY');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialTask) {
            setTitle(initialTask.title);
            setDescription(initialTask.description || '');
            setSubject(initialTask.subject || '');
            setPriority(initialTask.priority);
            setIsRecurring(initialTask.isRecurring || false);
            setRecurrenceRule(initialTask.recurrenceRule || 'DAILY');
            // Format for datetime-local: YYYY-MM-DDThh:mm
            if (initialTask.dueDate) {
                const date = new Date(initialTask.dueDate);
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                setDueDate(date.toISOString().slice(0, 16));
            } else {
                setDueDate('');
            }
        } else {
            // Reset for Create mode
            setTitle('');
            setDescription('');
            setSubject('');
            setPriority('MEDIUM');
            setIsRecurring(false);
            setRecurrenceRule('DAILY');

            if (initialDate) {
                const date = new Date(initialDate);
                date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                setDueDate(date.toISOString().slice(0, 16));
            } else {
                setDueDate('');
            }
        }
    }, [initialTask, isOpen, initialDate]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                title,
                description,
                subject: subject || '',
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                isRecurring,
                recurrenceRule: isRecurring ? recurrenceRule : undefined
            };

            let savedTask;
            // Note: We should ideally use the context actions here to ensuring state updates
            // But the modal props expect us to return the saved task.
            // For now, let's keep the local API call but trigger a refresh in the parent?
            // OR better, let's refactor this modal to behave more like a form that calls a prop.

            // The user wants clear connecting.
            // Let's assume the parent passes a properly connected onSave that Does the API Call?
            // No, the Planner passed an empty handler.

            // Let's modify this to use the API directly (as before) BUT expose a hook to refresh context?
            // OR easier: import useData() here and call refreshData() after success.

            if (initialTask) {
                const { data } = await tasksApi.update(initialTask.id, payload);
                savedTask = data.task;
            } else {
                const { data } = await tasksApi.create(payload);
                savedTask = data.task;
            }

            onSave(savedTask);
            onClose();
        } catch (error) {
            console.error('Failed to save task', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[var(--bg-surface-0)] border border-[var(--border-subtle)] rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        {initialTask ? 'Edit Task' : 'New Task'}
                    </h2>
                    <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                            placeholder="e.g., Complete Math Assignment"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Details</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none h-24"
                            placeholder="Add more context..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                                placeholder="Physics"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Due Date</label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] [color-scheme:dark]"
                        />
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isRecurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="w-4 h-4 rounded border-[var(--border-element)] bg-[var(--bg-surface-1)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                            />
                            <label htmlFor="isRecurring" className="text-sm text-[var(--text-primary)] cursor-pointer select-none">
                                Recurring Task
                            </label>
                        </div>

                        {isRecurring && (
                            <select
                                value={recurrenceRule}
                                onChange={(e) => setRecurrenceRule(e.target.value)}
                                className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                            >
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                            </select>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-1)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            {isLoading && <Loader2 size={16} className="animate-spin" />}
                            {initialTask ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
