import { useState } from 'react';
import {
    Briefcase,
    GraduationCap,
    TrendingUp,
    ChevronRight,
    Sparkles,
    BookOpen,
    Code,
    Brain,
    Target,
    Award
} from 'lucide-react';

export function CareerGuidance() {
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    const careerPaths = [
        {
            id: 'software',
            title: 'Software Engineer',
            icon: Code,
            description: 'Build applications and systems that power the digital world',
            skills: ['Programming', 'Data Structures', 'System Design', 'Problem Solving'],
            avgSalary: '$120,000',
            demand: 'Very High',
            match: 92,
        },
        {
            id: 'data',
            title: 'Data Scientist',
            icon: Brain,
            description: 'Extract insights from data using ML and statistical analysis',
            skills: ['Python', 'Machine Learning', 'Statistics', 'SQL'],
            avgSalary: '$130,000',
            demand: 'High',
            match: 85,
        },
        {
            id: 'product',
            title: 'Product Manager',
            icon: Target,
            description: 'Lead product strategy and work with cross-functional teams',
            skills: ['Communication', 'Analytics', 'Strategy', 'Leadership'],
            avgSalary: '$140,000',
            demand: 'High',
            match: 78,
        },
        {
            id: 'research',
            title: 'Research Scientist',
            icon: BookOpen,
            description: 'Advance knowledge through scientific research and innovation',
            skills: ['Research Methods', 'Critical Thinking', 'Writing', 'Analysis'],
            avgSalary: '$110,000',
            demand: 'Medium',
            match: 70,
        },
    ];

    const skillsAssessment = [
        { skill: 'Programming', level: 85, category: 'Technical' },
        { skill: 'Problem Solving', level: 90, category: 'Core' },
        { skill: 'Communication', level: 75, category: 'Soft' },
        { skill: 'Mathematics', level: 80, category: 'Technical' },
        { skill: 'Leadership', level: 65, category: 'Soft' },
    ];

    const recommendations = [
        { title: 'Complete Advanced Algorithms Course', type: 'Course', priority: 'High' },
        { title: 'Build 2 Full-Stack Projects', type: 'Project', priority: 'High' },
        { title: 'Practice System Design', type: 'Skill', priority: 'Medium' },
        { title: 'Contribute to Open Source', type: 'Experience', priority: 'Medium' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Career Guidance 🧭
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        AI-powered career planning and skill development
                    </p>
                </div>
                <button className="btn btn-primary">
                    <Sparkles size={18} />
                    Get AI Assessment
                </button>
            </div>

            {/* Profile Summary */}
            <div className="card gradient-primary text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                            <GraduationCap size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Your Career Profile</h2>
                            <p className="text-white/80">Computer Science Student • 3rd Year</p>
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold">92%</p>
                            <p className="text-sm text-white/80">Profile Strength</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold">4</p>
                            <p className="text-sm text-white/80">Career Matches</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Career Paths */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Recommended Career Paths
                    </h2>
                    {careerPaths.map((path) => (
                        <div
                            key={path.id}
                            className={`card cursor-pointer transition-all hover:scale-[1.01] ${selectedPath === path.id ? 'ring-2 ring-[var(--primary-500)]' : ''
                                }`}
                            onClick={() => setSelectedPath(path.id === selectedPath ? null : path.id)}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ background: 'var(--primary-600)', color: 'white' }}
                                >
                                    <path.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                                            {path.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="badge"
                                                style={{
                                                    background: path.match >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                    color: path.match >= 80 ? '#22c55e' : '#f59e0b',
                                                }}
                                            >
                                                {path.match}% Match
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                                        {path.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {path.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2 py-1 rounded-md text-xs"
                                                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                                        <span className="flex items-center gap-1">
                                            <Briefcase size={14} />
                                            {path.avgSalary}/year
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp size={14} />
                                            Demand: {path.demand}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
                            </div>

                            {/* Expanded Content */}
                            {selectedPath === path.id && (
                                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                                    <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                                        Roadmap to {path.title}
                                    </h4>
                                    <div className="grid md:grid-cols-3 gap-3">
                                        <div className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
                                                STEP 1
                                            </p>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                Complete Core Courses
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
                                                STEP 2
                                            </p>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                Build Portfolio
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
                                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
                                                STEP 3
                                            </p>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                Get Internship
                                            </p>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary mt-4">
                                        Start This Path
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Skills Assessment */}
                    <div className="card">
                        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Your Skills
                        </h3>
                        <div className="space-y-4">
                            {skillsAssessment.map((skill) => (
                                <div key={skill.skill}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span style={{ color: 'var(--text-primary)' }}>{skill.skill}</span>
                                        <span style={{ color: 'var(--text-tertiary)' }}>{skill.level}%</span>
                                    </div>
                                    <div className="progress h-2">
                                        <div
                                            className="progress-bar"
                                            style={{
                                                width: `${skill.level}%`,
                                                background: skill.level >= 80 ? '#22c55e' : skill.level >= 60 ? '#f59e0b' : '#ef4444',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-secondary w-full mt-4">
                            Take Skills Assessment
                        </button>
                    </div>

                    {/* Recommendations */}
                    <div className="card">
                        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            AI Recommendations
                        </h3>
                        <div className="space-y-3">
                            {recommendations.map((rec, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 rounded-lg"
                                    style={{ background: 'var(--bg-tertiary)' }}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full mt-2 ${rec.priority === 'High' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {rec.title}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                            {rec.type}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="card">
                        <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <Award size={18} className="text-yellow-500" />
                            Achievements
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {['🏆 Dean\'s List', '💻 First Project', '📚 100 Hours', '🔥 30 Day Streak'].map((badge) => (
                                <span
                                    key={badge}
                                    className="px-3 py-1.5 rounded-full text-sm"
                                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                                >
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
