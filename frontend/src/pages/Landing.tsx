
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Target, Users, ArrowRight, Zap } from 'lucide-react';

export function Landing() {
    return (
        <div className="min-h-screen bg-[var(--bg-surface-0)] text-[var(--text-primary)] flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-1)]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                            <Sparkles className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">StudyVerse</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/auth/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            Log in
                        </Link>
                        <Link to="/auth/register" className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-surface-0)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                            Sign up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col">
                <section className="py-20 px-6 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-sm font-medium mb-8">
                        <Zap size={14} fill="currentColor" />
                        <span>The Ultimate Student OS 2.0</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-balance bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-tertiary)] bg-clip-text text-transparent">
                        Master your studies<br /> with AI-powered focus.
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed">
                        Combine tasks, notes, habits, and community in one aesthetic workspace.
                        Gamify your focus and perform at your peak.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/auth/register" className="px-8 py-4 bg-[var(--accent-primary)] text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg hover:shadow-[var(--accent-primary)]/25 flex items-center gap-2">
                            Get Started for Free <ArrowRight size={20} />
                        </Link>
                        <Link to="/auth/login" className="px-8 py-4 bg-[var(--bg-surface-2)] text-[var(--text-primary)] font-medium rounded-xl hover:bg-[var(--bg-surface-3)] transition-all">
                            Live Demo
                        </Link>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 px-6 bg-[var(--bg-surface-1)]">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain size={32} className="text-purple-500" />}
                            title="Second Brain"
                            description="AI-powered notes and flashcards that organize themselves. Never forget a concept again."
                        />
                        <FeatureCard
                            icon={<Target size={32} className="text-blue-500" />}
                            title="Gamified Focus"
                            description="Earn XP, climb leaderboards, and unlock badges just by staying focused on your work."
                        />
                        <FeatureCard
                            icon={<Users size={32} className="text-pink-500" />}
                            title="Study Communities"
                            description="Join real-time study rooms and hold each other accountable with live chat."
                        />
                    </div>
                </section>
            </main>

            <footer className="py-8 px-6 border-t border-[var(--border-subtle)] text-center text-[var(--text-tertiary)] text-sm">
                <p>&copy; {new Date().getFullYear()} StudyVerse. Built for students, by students.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-[var(--bg-surface-0)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/50 transition-colors group">
            <div className="mb-6 p-4 bg-[var(--bg-surface-2)] rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </div>
    );
}
