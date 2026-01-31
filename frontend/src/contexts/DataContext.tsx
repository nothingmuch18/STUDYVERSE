import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
    Task,
    StudyPlan,
    Quiz,
    Habit,
    AnalyticsSummary,
    StudySession,
    Note
} from '../types';
import { useAuth } from './AuthContext';
import client from '../api/client';

interface DataContextType {
    tasks: Task[];
    studyPlans: StudyPlan[];
    habits: Habit[];
    analytics: AnalyticsSummary;
    studySessions: StudySession[];
    quizzes: Quiz[];
    notes: Note[];
    isLoading: boolean;
    refreshData: () => Promise<void>;
    addTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    completeTask: (taskId: string) => Promise<void>;
    createHabit: (habit: Partial<Habit>) => Promise<void>;
    toggleHabit: (habitId: string) => Promise<void>;
    deleteHabit: (habitId: string) => Promise<void>;
    recordStudySession: (session: Partial<StudySession>) => Promise<void>;
    // Placeholders to satisfy existing components until implemented
    addHabit: (habit: any) => Promise<void>;
    updateHabit: (id: string, updates: any) => Promise<void>;
    checkInHabit: (id: string) => Promise<void>;
    addStudySession: (session: any) => Promise<void>;
    generateStudyPlan: (subject: string, hours: number) => Promise<void>;
    startStudySession: (subject: string) => void;
    endStudySession: () => void;
    activeStudyPlan: StudyPlan | null;
    activeSession: StudySession | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial empty state
const INITIAL_ANALYTICS: AnalyticsSummary = {
    totalStudyHours: 0,
    weeklyStudyHours: [0, 0, 0, 0, 0, 0, 0],
    subjectProgress: [],
    quizzesTaken: 0,
    averageQuizScore: 0,
    streakDays: 0,
    tasksCompleted: 0,
    weakAreas: [],
    weeklyFocusHours: 0,
    completionRate: 0,
    totalTasksCompleted: 0
};

export function DataProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [studyPlans] = useState<StudyPlan[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsSummary>(INITIAL_ANALYTICS);
    const [studySessions, setStudySessions] = useState<StudySession[]>([]);
    const [quizzes] = useState<Quiz[]>([]);
    const [notes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSession, setActiveSession] = useState<any>(null);

    const refreshData = useCallback(async () => {
        if (!isAuthenticated) return;

        // Don't set global loading on background refresh (polite polling)
        // setIsLoading(true); 
        try {
            const [
                tasksRes,
                habitsRes,
                analyticsRes,
                sessionsRes,
                activeSessionRes
            ] = await Promise.all([
                client.get('/tasks').catch(() => ({ data: { tasks: [] } })),
                client.get('/habits').catch(() => ({ data: { habits: [] } })),
                client.get('/analytics').catch(() => ({ data: INITIAL_ANALYTICS })),
                client.get('/sessions').catch(() => ({ data: { sessions: [] } })),
                client.get('/sessions/active').catch(() => ({ data: { session: null } })),
            ]);

            // Tasks
            if (tasksRes.data?.tasks) {
                setTasks(tasksRes.data.tasks.map((t: any) => ({
                    ...t,
                    dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                    createdAt: new Date(t.createdAt),
                })));
            }

            // Habits
            if (habitsRes.data?.habits) {
                setHabits(habitsRes.data.habits);
            }

            // Analytics
            const rawAnalytics = analyticsRes.data || INITIAL_ANALYTICS;
            setAnalytics({
                ...INITIAL_ANALYTICS,
                ...rawAnalytics,
                tasksCompleted: rawAnalytics.totalTasksCompleted || rawAnalytics.tasksCompleted || 0,
                weeklyStudyHours: rawAnalytics.weeklyStudyHours || [],
                subjectProgress: rawAnalytics.subjectBreakdown || rawAnalytics.subjectProgress || []
            });

            // Sessions
            if (sessionsRes.data?.sessions) {
                setStudySessions(sessionsRes.data.sessions.map((s: any) => ({
                    ...s,
                    startTime: new Date(s.startTime),
                    endTime: s.endTime ? new Date(s.endTime) : undefined,
                })));
            }

            // Active Session
            if (activeSessionRes.data?.session) {
                const s = activeSessionRes.data.session;
                setActiveSession({
                    ...s,
                    startTime: new Date(s.startTime)
                });
            } else {
                setActiveSession(null);
            }

        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    }, [isAuthenticated]);

    // Initial fetch
    useEffect(() => {
        if (isAuthenticated) {
            setIsLoading(true);
            refreshData().finally(() => setIsLoading(false));

            // Poll every 30 seconds to keep dashboard fresh
            const interval = setInterval(refreshData, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, refreshData]);

    // --- ACTIONS ---

    const addTask = async (taskData: Partial<Task>) => {
        await client.post('/tasks', taskData);
        // Optimistic update or refresh
        await refreshData();
    };

    const updateTask = async (taskId: string, updates: Partial<Task>) => {
        await client.patch(`/tasks/${taskId}`, updates);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
        refreshData(); // Refresh analytics
    };

    const deleteTask = async (taskId: string) => {
        await client.delete(`/tasks/${taskId}`);
        setTasks(prev => prev.filter(t => t.id !== taskId));
        refreshData();
    };

    const completeTask = async (taskId: string) => {
        return updateTask(taskId, { status: 'COMPLETED', completedAt: new Date() });
    };

    const createHabit = async (habitData: Partial<Habit>) => {
        await client.post('/habits', habitData);
        await refreshData();
    };

    const toggleHabit = async (habitId: string) => {
        // Optimistic UI update could go here
        await client.post(`/habits/${habitId}/check`);
        await refreshData();
    };

    const deleteHabit = async (habitId: string) => {
        await client.delete(`/habits/${habitId}`);
        setHabits(prev => prev.filter(h => h.id !== habitId));
    };

    const startStudySession = async (subject: string) => {
        try {
            const { data } = await client.post('/sessions/start', { subject });
            setActiveSession({ ...data.session, startTime: new Date(data.session.startTime) });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const endStudySession = async () => {
        if (!activeSession) return;
        try {
            await client.post(`/sessions/${activeSession.id}/end`, { focusScore: 100 });
            setActiveSession(null);
            refreshData();
        } catch (e) {
            console.error(e);
        }
    };

    // Compatibility stubs
    const recordStudySession = async () => { };
    const addHabit = createHabit;
    const updateHabit = async () => { };
    const checkInHabit = toggleHabit;
    const addStudySession = recordStudySession;
    const generateStudyPlan = async () => { };
    const activeStudyPlan = null;

    return (
        <DataContext.Provider
            value={{
                tasks,
                studyPlans,
                habits,
                analytics,
                studySessions,
                quizzes,
                notes,
                isLoading,
                refreshData,
                addTask,
                updateTask,
                deleteTask,
                completeTask,
                createHabit,
                toggleHabit,
                deleteHabit,
                recordStudySession,
                addHabit,
                updateHabit,
                checkInHabit,
                addStudySession,
                generateStudyPlan,
                startStudySession,
                endStudySession,
                activeStudyPlan,
                // Expose active session for UI
                // @ts-ignore - Extending interface on fly
                activeSession
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
