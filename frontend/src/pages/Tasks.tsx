import { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { tasksApi } from '../lib/api';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal, type Task } from '../components/tasks/TaskModal';
// import { useAuth } from '../contexts/AuthContext';

export function Tasks() {
    // const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, COMPLETED

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setIsLoading(true);
            const res = await tasksApi.getAll();
            setTasks(res.data);
        } catch (error) {
            console.error(error);
            setMsg('Failed to load tasks. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaskUpdate = (updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleTaskDelete = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleTaskCreate = (newTask: Task) => {
        setTasks(prev => [newTask, ...prev]);
        setIsModalOpen(false);
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'ALL') return task.status !== 'COMPLETED' && task.status !== 'CANCELLED';
        if (filter === 'COMPLETED') return task.status === 'COMPLETED';
        return true;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Tasks</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Manage your academic workload</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-[var(--accent-primary)]/20"
                >
                    <Plus size={20} />
                    <span>New Task</span>
                </button>
            </div>

            {msg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                    {msg}
                </div>
            )}

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-[var(--accent-secondary)] text-white' : 'bg-[var(--bg-surface-1)] text-[var(--text-secondary)] hover:text-white'}`}
                >
                    To Do
                </button>
                <button
                    onClick={() => setFilter('COMPLETED')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'COMPLETED' ? 'bg-[var(--accent-secondary)] text-white' : 'bg-[var(--bg-surface-1)] text-[var(--text-secondary)] hover:text-white'}`}
                >
                    Completed
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onUpdate={handleTaskUpdate}
                            onDelete={handleTaskDelete}
                        />
                    ))}
                    {filteredTasks.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--bg-surface-1)] mb-4">
                                <Filter className="text-[var(--text-tertiary)]" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-[var(--text-secondary)]">No tasks found</h3>
                            <p className="text-[var(--text-tertiary)] mt-1">Create a new task to get started</p>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleTaskCreate}
                />
            )}
        </div>
    );
}
