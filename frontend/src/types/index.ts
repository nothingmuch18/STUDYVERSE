// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'admin';
    profileImage?: string;
    preferences: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    studyHoursPerDay: number;
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    notifications: boolean;
    pomodoroWorkDuration: number;
    pomodoroBreakDuration: number;
}

// Study Plan Types
export interface StudyPlan {
    id: string;
    userId: string;
    title: string;
    subjects: Subject[];
    startDate: Date;
    endDate: Date;
    dailySchedule: DailySchedule[];
    isActive: boolean;
    createdAt: Date;
}

export interface Subject {
    id: string;
    name: string;
    topics: string[];
    priority: 'high' | 'medium' | 'low';
    hoursAllocated: number;
    progress: number;
}

export interface DailySchedule {
    date: string;
    subjects: ScheduleItem[];
    totalHours: number;
    notes?: string;
    completed: boolean;
}

export interface ScheduleItem {
    subject: string;
    topic: string;
    durationMinutes: number;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    resources?: string[];
}

// Notes Types
export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string;
    sourceType: 'pdf' | 'youtube' | 'text';
    sourceUrl?: string;
    keyPoints: string[];
    summary: string;
    mcqs: MCQ[];
    createdAt: Date;
}

export interface MCQ {
    id: string;
    question: string;
    options: {
        a: string;
        b: string;
        c: string;
        d: string;
    };
    correctAnswer: 'a' | 'b' | 'c' | 'd';
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
}

// Quiz Types
export interface Quiz {
    id: string;
    userId: string;
    title: string;
    subject: string;
    questions: MCQ[];
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    timeLimit: number; // in minutes
    createdAt: Date;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    answers: { questionId: string; answer: string }[];
    score: number;
    totalQuestions: number;
    timeTaken: number; // in seconds
    completedAt: Date;
}

// Task Types
export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    dueDate?: Date;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'URGENT'; // Matched backend strings
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; // Matched backend strings
    completedAt?: Date;
    subject?: string;
    createdAt: Date;
    updatedAt?: Date;
}

// Habit Types
export interface Habit {
    id: string;
    userId: string;
    title: string;
    frequency: number;
    streak: number;
    completedDates: string[];
    createdAt: Date;
}

// Analytics Types
export interface AnalyticsSummary {
    totalStudyHours: number;
    weeklyStudyHours: number[];
    weeklyFocusHours: number;
    subjectProgress: { name: string; value: number }[];
    streakDays: number;
    tasksCompleted: number;
    completionRate: number;
    totalTasksCompleted: number;
    quizzesTaken: number;
    averageQuizScore: number;
    weakAreas: { topic: string; score: number }[];
}

export interface StudySession {
    id: string;
    userId: string;
    subject: string;
    startTime: Date;
    endTime?: Date;
    duration?: number; // in minutes
    focusScore?: number;
    notes?: string;
}

// Career Types
export interface Resume {
    id: string;
    userId: string;
    fileUrl: string;
    parsedData: ParsedResume;
    aiFeedback: string;
    skillGaps: SkillGap[];
    careerPaths: CareerPath[];
    createdAt: Date;
}

export interface ParsedResume {
    name: string;
    email: string;
    phone: string;
    skills: string[];
    education: Education[];
    experience: Experience[];
}

export interface Education {
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
}

export interface Experience {
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
}

export interface SkillGap {
    skill: string;
    importance: 'high' | 'medium' | 'low';
    resources: string[];
}

export interface CareerPath {
    title: string;
    matchPercentage: number;
    requirements: string[];
    roadmap: string[];
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
