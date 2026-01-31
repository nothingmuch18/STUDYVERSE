import { useState } from 'react';
import { tasksApi } from '../../lib/api';
import { Calendar, CheckCircle2, Trash2, Edit2 } from 'lucide-react';
import { TaskModal, type Task } from './TaskModal';

interface TaskCardProps {
    task: Task;
    onUpdate: (task: Task) => void;
    onDelete: (id: string) => void;
}

export function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const priorityColors = {
        LOW: 'text-blue-400 bg-blue-400/10',
        MEDIUM: 'text-yellow-400 bg-yellow-400/10',
        HIGH: 'text-orange-400 bg-orange-400/10',
        URGENT: 'text-red-400 bg-red-400/10',
    };

    const handleStatusToggle = async () => {
        try {
            const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
            const { data } = await tasksApi.update(task.id, { status: newStatus });
            onUpdate(data.task);
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            setIsDeleting(true);
            await tasksApi.delete(task.id);
            onDelete(task.id);
        } catch (error) {
            console.error('Failed to delete task', error);
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className={`glass-panel p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-all group ${task.status === 'COMPLETED' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                    <button
                        onClick={handleStatusToggle}
                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'COMPLETED'
                            ? 'bg-[var(--accent-secondary)] border-[var(--accent-secondary)]'
                            : 'border-[var(--text-tertiary)] hover:border-[var(--accent-secondary)]'
                            }`}
                    >
                        {task.status === 'COMPLETED' && <CheckCircle2 size={12} className="text-white" />}
                    </button>

                    <div className="flex-1 min-w-0" onClick={() => setIsEditModalOpen(true)}>
                        <div className="flex items-center gap-2 mb-1 cursor-pointer">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                                {task.priority}
                            </span>
                            {task.subject && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-secondary)]">
                                    {task.subject}
                                </span>
                            )}
                        </div>

                        <h3 className={`font-medium text-[var(--text-primary)] truncate cursor-pointer hover:text-[var(--accent-primary)] ${task.status === 'COMPLETED' ? 'line-through text-[var(--text-tertiary)]' : ''}`}>
                            {task.title}
                        </h3>

                        {task.description && (
                            <p className="text-sm text-[var(--text-tertiary)] mt-1 line-clamp-2 cursor-pointer">
                                {task.description}
                            </p>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-tertiary)]">
                            {task.dueDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative flex gap-1">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary)]/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Task"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-1.5 text-[var(--text-tertiary)] hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Task"
                        >
                            {isDeleting ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={onUpdate}
                initialTask={task}
            />
        </>
    );
}
