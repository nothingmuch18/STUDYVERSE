import { useState, useEffect } from 'react';
import {
    Play,
    Clock,
    Brain,
    Trophy,
    ChevronRight,
    CheckCircle,
    XCircle,
    Plus,
    Target,
    Zap,
    AlertCircle,
    Award,
    BookOpen
} from 'lucide-react';

import { quizApi } from '../lib/api';

export function Quiz() {
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [currentQuiz, setCurrentQuiz] = useState<any>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [answers, setAnswers] = useState<number[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);

    // Fetch Quizzes from Backend
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const { data } = await quizApi.getAll();
                setAvailableQuizzes(data.quizzes);
            } catch (error) {
                console.error("Failed to load quizzes", error);
            }
        };
        fetchQuizzes();
    }, []);

    // Timer effect
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (currentQuiz && !showResult && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [currentQuiz, showResult, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startQuiz = async (quizId: string) => {
        try {
            const { data } = await quizApi.getById(quizId);
            setCurrentQuiz(data.quiz);
            setCurrentQuestion(0);
            setSelectedAnswer(null);
            setShowResult(false);
            setAnswers([]);
            setTimeLeft(15 * 60); // Default time, could come from API
        } catch (e) {
            console.error(e);
        }
    };

    const submitAnswer = () => {
        if (selectedAnswer !== null) {
            setAnswers([...answers, selectedAnswer]);
            if (currentQuestion < currentQuiz.questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
            } else {
                finishQuiz([...answers, selectedAnswer]);
            }
        }
    };

    const finishQuiz = async (finalAnswers: number[]) => {
        setCurrentQuiz((prev: any) => ({ ...prev, answers: finalAnswers })); // Optimistic
        setShowResult(true);

        // Calculate score
        const score = finalAnswers.reduce((acc, ans, idx) => {
            return ans === currentQuiz.questions[idx].correct ? acc + 1 : acc;
        }, 0);

        try {
            await quizApi.submit(currentQuiz.id, score);
        } catch (e) {
            console.error("Failed to submit score", e);
        }
    };

    const calculateScore = () => {
        if (!currentQuiz) return 0;
        return answers.reduce((score, answer, index) => {
            return answer === currentQuiz.questions[index].correct ? score + 1 : score;
        }, 0);
    };

    const difficultyColors: Record<string, string> = {
        easy: '#22c55e',
        medium: '#f59e0b',
        hard: '#ef4444',
    };

    if (currentQuiz && !showResult) {
        const question = currentQuiz.questions[currentQuestion];
        const progress = ((currentQuestion) / currentQuiz.questions.length) * 100;

        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
                {/* Quiz Header */}
                <div className="card sticky top-4 z-40 bg-[var(--bg-secondary)]/95 backdrop-blur shadow-lg border-[var(--primary-500)]/20">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                                {currentQuiz.title}
                            </h2>
                            <p className="text-xs text-[var(--text-secondary)]">Question {currentQuestion + 1} of {currentQuiz.questions.length}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] font-mono font-medium ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'}`}>
                                <Clock size={16} />
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="overflow-hidden h-2 rounded-full bg-[var(--bg-tertiary)]">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="card min-h-[400px] flex flex-col justify-between animate-slide-up">
                    <div className="mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <span className="badge badge-primary">Multiple Choice</span>
                            <button className="text-[var(--text-tertiary)] hover:text-[var(--primary-400)] transition-colors">
                                <AlertCircle size={18} />
                            </button>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            {question.question}
                        </h3>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-8">
                        {question.options.map((option: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => setSelectedAnswer(index)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden group ${selectedAnswer === index
                                    ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
                                    : 'border-[var(--border-secondary)] hover:border-[var(--primary-300)] hover:bg-[var(--bg-tertiary)]'
                                    }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${selectedAnswer === index
                                            ? 'bg-[var(--primary-500)] text-white scale-110'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] group-hover:bg-[var(--bg-secondary)]'
                                            }`}
                                    >
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className={`font-medium transition-colors ${selectedAnswer === index ? 'text-[var(--primary-600)]' : 'text-[var(--text-primary)]'}`}>
                                        {option}
                                    </span>
                                </div>
                                {selectedAnswer === index && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)]/5 to-transparent pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between pt-6 border-t border-[var(--border-primary)]">
                        <button
                            onClick={() => setCurrentQuiz(null)}
                            className="btn btn-ghost hover:bg-red-500/10 hover:text-red-500"
                        >
                            quit Quiz
                        </button>
                        <button
                            onClick={submitAnswer}
                            className="btn btn-primary px-8"
                            disabled={selectedAnswer === null}
                        >
                            {currentQuestion === currentQuiz.questions.length - 1 ? 'Finish' : 'Next'}
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResult) {
        const score = calculateScore();
        const percentage = Math.round((score / currentQuiz.questions.length) * 100);
        const passed = percentage >= 60;

        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-scale-in pb-10">
                <div className="card text-center py-10 relative overflow-hidden">
                    {/* Background confetti effect (simplified css) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-tertiary)] -z-10" />

                    <div className="mb-8 relative inline-block">
                        <div className={`relative z-10 w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-xl ${passed ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-orange-400 to-red-500'
                            }`}>
                            <Trophy size={64} className="text-white drop-shadow-md" />
                        </div>
                        <div className={`absolute -inset-4 rounded-full blur-xl opacity-40 ${passed ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>

                    <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {percentage >= 90 ? 'Outstanding!' : percentage >= 70 ? 'Great Job!' : 'Keep Practicing!'}
                    </h2>

                    <p className="mb-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
                        You answered <span className="font-bold text-[var(--text-primary)]">{score}</span> out of <span className="font-bold text-[var(--text-primary)]">{currentQuiz.questions.length}</span> correctly
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
                        <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)]">
                            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Score</p>
                            <p className={`text-2xl font-bold ${passed ? 'text-green-500' : 'text-orange-500'}`}>{percentage}%</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)]">
                            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Time</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)]">4:20</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-[var(--bg-tertiary)]">
                            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">XP Earned</p>
                            <p className="text-2xl font-bold text-[var(--primary-500)]">+{score * 50}</p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setCurrentQuiz(null)}
                            className="btn btn-secondary min-w-[140px]"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>

                {/* Detailed Results */}
                <div className="card">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <BookOpen size={20} className="text-[var(--primary-400)]" />
                        Detailed Review
                    </h3>
                    <div className="space-y-4">
                        {currentQuiz.questions.map((q: any, index: number) => (
                            <div
                                key={index}
                                className={`p-5 rounded-xl border-l-4 transition-all ${answers[index] === q.correct
                                    ? 'bg-green-500/5 border-green-500'
                                    : 'bg-red-500/5 border-red-500'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${answers[index] === q.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                        {answers[index] === q.correct ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold mb-3 text-[var(--text-primary)]">
                                            {index + 1}. {q.question}
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                                            <div className={`p-3 rounded-lg text-sm border ${answers[index] === q.correct
                                                ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300'
                                                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300'
                                                }`}>
                                                <span className="font-bold block text-xs opacity-70 mb-1">YOUR ANSWER</span>
                                                {q.options[answers[index]] || "Skipped"}
                                            </div>
                                            {answers[index] !== q.correct && (
                                                <div className="p-3 rounded-lg text-sm border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300">
                                                    <span className="font-bold block text-xs opacity-70 mb-1">CORRECT ANSWER</span>
                                                    {q.options[q.correct]}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm bg-[var(--bg-tertiary)] p-3 rounded-lg inline-block" style={{ color: 'var(--text-secondary)' }}>
                                            <span className="font-bold text-[var(--primary-400)] mr-2">Explanation:</span>
                                            {q.explanation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        Quiz & Exams <Brain className="text-[var(--primary-500)]" />
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Master your subjects with AI-generated quizzes and track your performance
                    </p>
                </div>
                <button className="btn btn-primary group">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    Create Custom Quiz
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { icon: Trophy, label: 'Quizzes Taken', value: '23', color: 'yellow' },
                    { icon: Target, label: 'Avg. Score', value: '78%', color: 'green' },
                    { icon: Zap, label: 'Questions', value: '156', color: 'blue' },
                    { icon: Clock, label: 'Time Spent', value: '4h 30m', color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="card-interactive text-center group">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Available Quizzes */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Brain size={20} className="text-[var(--primary-400)]" />
                    Recommended Quizzes
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {availableQuizzes.map((quiz) => (
                        <div key={quiz.id} className="card-interactive hover-glow group relative overflow-hidden">
                            {/* Decorative gradient blob */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${quiz.color}-500/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500`} />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div>
                                    <h3 className="font-bold text-lg mb-1 group-hover:text-[var(--primary-500)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                                        {quiz.title}
                                    </h3>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                        {quiz.subject}
                                    </p>
                                </div>
                                <span
                                    className={`badge font-bold px-3 py-1 uppercase text-[10px] tracking-wide border bg-${difficultyColors[quiz.difficulty]}10 text-${difficultyColors[quiz.difficulty]} border-${difficultyColors[quiz.difficulty]}20`}
                                    style={{
                                        color: difficultyColors[quiz.difficulty],
                                    }}
                                >
                                    {quiz.difficulty}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 mb-6 text-sm relative z-10" style={{ color: 'var(--text-tertiary)' }}>
                                <span className="flex items-center gap-1.5">
                                    <Award size={16} />
                                    {quiz.questions} Questions
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={16} />
                                    {quiz.time} Minutes
                                </span>
                            </div>

                            <button
                                onClick={() => startQuiz(quiz.id)}
                                className="btn btn-primary w-full group-hover:shadow-lg transition-all"
                            >
                                <Play size={16} fill="currentColor" />
                                Start Quiz Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
