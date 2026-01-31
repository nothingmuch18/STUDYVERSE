
import { useState, useEffect } from 'react';
import { Target, Plus, Trophy, Loader2 } from 'lucide-react';
import { goalsApi } from '../lib/api';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';
}

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Goal Form
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(10);
  const [unit, setUnit] = useState('hours');
  const [period, setPeriod] = useState<'WEEKLY' | 'DAILY' | 'MONTHLY'>('WEEKLY');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data } = await goalsApi.getAll();
      setGoals(data.goals);
    } catch (error) {
      console.error('Failed to load goals', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await goalsApi.create({ title, target, unit, period });
      setGoals([data.goal, ...goals]);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create goal', error);
    }
  };

  const handleUpdateProgress = async (id: string, newCurrent: number) => {
    try {
      const { data } = await goalsApi.updateProgress(id, newCurrent);
      setGoals(goals.map(g => g.id === id ? data.goal : g));
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setTarget(10);
    setUnit('hours');
    setPeriod('WEEKLY');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Exam Goals & Milestones</h1>
          <p className="text-[var(--text-secondary)] mt-1">Track your exams and long-term academic progress.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={18} />
          New Goal
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[var(--text-tertiary)]" size={32} />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--border-subtle)] rounded-xl">
          <Trophy size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-secondary)]">No active goals</h3>
          <p className="text-[var(--text-tertiary)]">Set a target to stay motivated!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div key={goal.id} className="card-modern p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-3)] text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                        {goal.period}
                      </span>
                      {goal.status === 'COMPLETED' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-[var(--text-primary)]">{goal.title}</h3>
                  </div>
                  <div className="p-2 rounded-full bg-[var(--bg-surface-2)] text-[var(--text-secondary)]">
                    <Target size={20} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-secondary)]">Progress</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--bg-surface-3)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateProgress(goal.id, goal.current + 1)}
                    className="flex-1 py-2 bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors"
                  >
                    + Add Progress
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-surface-0)] border border-[var(--border-subtle)] rounded-xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Create New Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
                <input
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full input-primary" placeholder="e.g. Study Math" required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Target</label>
                  <input
                    type="number" value={target} onChange={e => setTarget(Number(e.target.value))}
                    className="w-full input-primary" required min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Unit</label>
                  <input
                    value={unit} onChange={e => setUnit(e.target.value)}
                    className="w-full input-primary" placeholder="hours, chapters" required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Period</label>
                <select
                  value={period} onChange={e => setPeriod(e.target.value as any)}
                  className="w-full input-primary"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[var(--text-secondary)] hover:text-white px-4 py-2">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
