import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3002/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('studyos_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('🔒 Auth Error (401): Redirecting to login', error.config.url);
            console.warn('⚠️ Auto-redirect disabled for debugging.');
            // Token expired or invalid
            // localStorage.removeItem('studyos_token');
            // localStorage.removeItem('studyos_user');

            // Only redirect if not already on auth pages
            // if (!window.location.pathname.includes('/auth/')) {
            //     window.location.href = '/auth/login';
            // }
        }
        return Promise.reject(error);
    }
);

// ============================================
// AUTH API
// ============================================
export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    getMe: () => api.get('/auth/me'),

    updateProfile: (data: { name?: string; avatarUrl?: string }) =>
        api.patch('/auth/me', data),
};

// ============================================
// TASKS API
// ============================================
export const tasksApi = {
    getAll: (params?: { status?: string; priority?: string }) =>
        api.get('/tasks', { params }),

    getById: (id: string) => api.get(`/tasks/${id}`),

    create: (data: {
        title: string;
        description?: string;
        subject?: string;
        priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        duration?: number;
        dueDate?: string;
    }) => api.post('/tasks', data),

    update: (id: string, data: Partial<{
        title: string;
        description: string;
        subject: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
        duration: number;
        dueDate: string;
    }>) => api.patch(`/tasks/${id}`, data),

    delete: (id: string) => api.delete(`/tasks/${id}`),
};

// ============================================
// SESSIONS API
// ============================================
export const sessionsApi = {
    getAll: (limit?: number) => api.get('/sessions', { params: { limit } }),

    getActive: () => api.get('/sessions/active'),

    start: (data: { subject?: string }) => api.post('/sessions/start', data),

    end: (id: string, data?: { focusScore?: number; notes?: string }) =>
        api.post(`/sessions/${id}/end`, data),
};

// ============================================
// ANALYTICS API
// ============================================
export const analyticsApi = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getActivity: () => api.get('/analytics/activity'),
    getSubjects: () => api.get('/analytics/subjects'),
};

// ============================================
// AI API
// ============================================
export const aiApi = {
    getInsights: () => api.post('/ai/insights'),
    getStudyPlan: (data: { goal: string, availableHours?: number, subjects?: string[] }) => api.post('/ai/study-plan', data),
    getQuickTip: () => api.get('/ai/quick-tip'),
    chat: (message: string, history: any[]) => api.post('/ai/chat', { message, history }),
    postChat: (data: { message: string, history: any[] }) => api.post('/ai/chat', data),
};

// ============================================
// HABITS API
// ============================================
export const habitsApi = {
    getAll: () => api.get('/habits'),
    create: (data: { title: string; frequency: number }) => api.post('/habits', data),
    checkIn: (id: string) => api.post(`/habits/${id}/check`),
    delete: (id: string) => api.delete(`/habits/${id}`),
};

// ============================================
// GOALS API
// ============================================
export const goalsApi = {
    getAll: () => api.get('/goals'),
    create: (data: { title: string; target: number; unit?: string; period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' }) => api.post('/goals', data),
    updateProgress: (id: string, current: number) => api.patch(`/goals/${id}`, { current }),
    delete: (id: string) => api.delete(`/goals/${id}`),
};

// ============================================
// JOBS API
// ============================================
export const jobsApi = {
    getJobs: () => api.get('/jobs'),
    save: (id: string) => api.post(`/jobs/${id}/save`),
    apply: (id: string) => api.post(`/jobs/${id}/apply`),
};

// ============================================
// COMMUNITY API
// ============================================
export const communityApi = {
    getGroups: () => api.get('/community/groups'),
    createGroup: (data: { name: string; description?: string; isPrivate?: boolean }) => api.post('/community/groups', data),
    joinGroup: (id: string) => api.post(`/community/groups/${id}/join`),

    // Messaging
    getMessages: (groupId: string) => api.get(`/community/groups/${groupId}/messages`),
    sendMessage: (groupId: string, content: string) => api.post(`/community/groups/${groupId}/messages`, { content }),

    // Posts (if needed, keeping for compatibility if utilized elsewhere)
    getPosts: (groupId: string) => api.get(`/community/groups/${groupId}/posts`),
    createPost: (groupId: string, data: any) => api.post(`/community/groups/${groupId}/posts`, data),
    likePost: (id: string) => api.post(`/community/posts/${id}/like`, {})
};

// ============================================
// CAREER API
// ============================================
export const careerApi = {
    getJobs: () => api.get('/career/jobs'),
    createJob: (data: any) => api.post('/career/jobs', data),
    analyzeResume: (text: string) => api.post('/career/analyze-resume', { text }),
};

// export const jobsApi = careerApi; // Alias for JobBoard component

// Analytics API merged above

// ============================================
// GAMIFICATION API
// ============================================
export const gamificationApi = {
    getStats: () => api.get('/gamification/stats'),
    getLeaderboard: () => api.get('/gamification/leaderboard'),
    getBadges: () => api.get('/gamification/badges')
};

// ============================================
// QUIZ API
// ============================================
export const quizApi = {
    getAll: () => api.get('/quizzes'),
    getById: (id: string) => api.get(`/quizzes/${id}`),
    submit: (id: string, score: number) => api.post(`/quizzes/${id}/submit`, { score })
};

// ============================================
// PAYMENTS API
// ============================================
export const paymentsApi = {
    createCheckoutSession: () => api.post('/payments/create-checkout-session'),
};

export default api;
