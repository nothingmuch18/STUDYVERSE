import { useState } from 'react';
import {
    Upload,
    Youtube,
    FileText,
    Sparkles,
    Loader,
    Book,
    ListChecks,
    FileQuestion,
    Clock,
    Download,
    Copy,
    CheckCircle,
    ArrowRight,
    Languages,
    Wand2
} from 'lucide-react';

export function NotesGenerator() {
    const [activeTab, setActiveTab] = useState<'pdf' | 'youtube' | 'text'>('pdf');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<any>(null);
    const [inputText, setInputText] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setUploadProgress(0);

        // Simulate progress intervals
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 10;
            });
        }, 300);

        // Simulate AI generation completion
        setTimeout(() => {
            clearInterval(interval);
            setUploadProgress(100);

            setTimeout(() => {
                setGeneratedContent({
                    title: 'Introduction to Machine Learning',
                    summary: 'Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. This module covers the fundamental concepts including supervised learning, unsupervised learning, and reinforcement learning approaches.',
                    keyPoints: [
                        'Machine Learning is a subset of Artificial Intelligence focusing on data-driven algorithms',
                        'Three main types: Supervised (labeled), Unsupervised (unlabeled), and Reinforcement Learning (reward-based)',
                        'Supervised learning uses labeled data for training models like Regression and Classification',
                        'Common algorithms include Linear Regression, Decision Trees, SVM, and Neural Networks',
                        'Model evaluation metrics differ by task: Accuracy, Precision, Recall, F1-Score, MSE',
                    ],
                    mcqs: [
                        {
                            question: 'What type of machine learning uses labeled data for training?',
                            options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
                            correct: 0,
                        },
                        {
                            question: 'Which metric is the harmonic mean of precision and recall?',
                            options: ['Accuracy', 'Precision', 'F1-Score', 'MSE'],
                            correct: 2,
                        },
                    ],
                });
                setIsGenerating(false);
            }, 500);
        }, 3000);
    };

    const savedNotes = [
        { id: '1', title: 'Data Structures - Trees', source: 'PDF', date: 'Jan 28, 2024', keyPoints: 12, color: 'blue' },
        { id: '2', title: 'React Hooks Tutorial', source: 'YouTube', date: 'Jan 27, 2024', keyPoints: 8, color: 'red' },
        { id: '3', title: 'Database Normalization', source: 'Text', date: 'Jan 25, 2024', keyPoints: 15, color: 'green' },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        AI Notes Generator <Wand2 className="text-[var(--primary-400)]" />
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Transform any content into structured study notes, summaries, and quizzes instantly.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary">
                        <Languages size={16} />
                        English
                    </button>
                    <button className="btn btn-primary">
                        <ListChecks size={16} />
                        View All Notes
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Input Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Source Tabs */}
                    <div className="card p-1">
                        <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl">
                            {[
                                { id: 'pdf', icon: FileText, label: 'PDF Upload' },
                                { id: 'youtube', icon: Youtube, label: 'YouTube' },
                                { id: 'text', icon: Book, label: 'Text / Paste' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-[var(--bg-secondary)] text-[var(--primary-600)] shadow-sm ring-1 ring-black/5'
                                        : 'text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {/* PDF Upload */}
                            {activeTab === 'pdf' && (
                                <div className="space-y-4 animate-scale-in">
                                    <div
                                        className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all hover:border-[var(--primary-500)] hover:bg-[var(--primary-50)] dark:hover:bg-[var(--primary-900)]/10 group"
                                        style={{ borderColor: 'var(--border-secondary)' }}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <Upload size={28} className="text-[var(--text-secondary)] group-hover:text-[var(--primary-500)]" />
                                        </div>
                                        <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                            PDF, DOCX, or PPTX (Max 50MB)
                                        </p>
                                        <button className="btn btn-primary">
                                            Browse Files
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* YouTube URL */}
                            {activeTab === 'youtube' && (
                                <div className="space-y-4 animate-scale-in">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                            YouTube Video URL
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Youtube size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                                                <input
                                                    type="url"
                                                    value={youtubeUrl}
                                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                                    placeholder="Paste video URL here..."
                                                    className="input pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-[var(--bg-tertiary)] flex gap-3 items-start">
                                        <Sparkles size={18} className="text-[var(--primary-400)] shrink-0 mt-0.5" />
                                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            AI will watch the video, extract key concepts, and generate a comprehensive study guide with timestamps.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Text Input */}
                            {activeTab === 'text' && (
                                <div className="space-y-4 animate-scale-in">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                            Study Material
                                        </label>
                                        <textarea
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            placeholder="Paste your notes, article, or topic here..."
                                            className="input min-h-[250px] resize-none font-mono text-sm leading-relaxed"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                                        <span>Min 100 characters</span>
                                        <span>{inputText.length} chars</span>
                                    </div>
                                </div>
                            )}

                            {/* Generate Button Area */}
                            <div className="mt-8 pt-6 border-t border-[var(--border-primary)]">
                                <div className="flex flex-wrap gap-4 mb-6">
                                    {['Summary', 'Key Points', 'Flashcards', 'Quiz', 'Mind Map'].map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" defaultChecked className="peer sr-only" />
                                                <div className="w-5 h-5 border-2 border-[var(--border-secondary)] rounded peer-checked:bg-[var(--primary-500)] peer-checked:border-[var(--primary-500)] transition-all"></div>
                                                <CheckCircle size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                            </div>
                                            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{opt}</span>
                                        </label>
                                    ))}
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    className={`btn btn-primary w-full h-12 text-lg relative overflow-hidden transition-all ${isGenerating ? 'cursor-not-allowed' : 'hover:shadow-lg'}`}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center gap-3">
                                            <Loader size={20} className="animate-spin" />
                                            <span className="animate-pulse">Analyzing Content... {Math.round(uploadProgress)}%</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Sparkles size={20} />
                                            Generate AI Study Details
                                        </>
                                    )}
                                    {/* Progress Bar Background */}
                                    {isGenerating && (
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Generated Content Preview */}
                    {generatedContent && (
                        <div className="card animate-slide-up ring-2 ring-[var(--primary-500)]/20 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
                            <div className="flex items-start justify-between mb-6 pb-6 border-b border-[var(--border-primary)]">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/10 text-purple-600">AI GENERATED</span>
                                        <span className="text-xs text-[var(--text-tertiary)]">Just now</span>
                                    </div>
                                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {generatedContent.title}
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn btn-secondary btn-icon" title="Copy">
                                        <Copy size={18} />
                                    </button>
                                    <button className="btn btn-primary btn-sm">
                                        <Download size={18} />
                                        PDF
                                    </button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <section>
                                        <h3 className="font-bold flex items-center gap-2 mb-3 text-[var(--text-primary)]">
                                            <Book size={18} className="text-[var(--primary-400)]" />
                                            Summary
                                        </h3>
                                        <p className="text-sm leading-7 text-[var(--text-secondary)] bg-[var(--bg-tertiary)] p-4 rounded-xl">
                                            {generatedContent.summary}
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold flex items-center gap-2 mb-3 text-[var(--text-primary)]">
                                            <ListChecks size={18} className="text-[var(--success-500)]" />
                                            Key Concepts
                                        </h3>
                                        <ul className="space-y-2">
                                            {generatedContent.keyPoints.map((point: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-400)] mt-2 flex-shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    <div className="card bg-[var(--bg-tertiary)] border-none">
                                        <h3 className="font-bold flex items-center gap-2 mb-4 text-[var(--text-primary)]">
                                            <FileQuestion size={18} className="text-[var(--warning-500)]" />
                                            Quick Quiz
                                        </h3>
                                        <div className="space-y-4">
                                            {generatedContent.mcqs.map((mcq: any, i: number) => (
                                                <div key={i} className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
                                                    <p className="font-medium text-sm mb-3">
                                                        <span className="text-[var(--primary-400)] mr-2">{i + 1}.</span>
                                                        {mcq.question}
                                                    </p>
                                                    <div className="space-y-1">
                                                        {mcq.options.map((opt: string, idx: number) => (
                                                            <button
                                                                key={idx}
                                                                className={`w-full text-left px-3 py-2 rounded text-xs transition-colors ${idx === mcq.correct
                                                                    ? 'bg-green-500/10 text-green-600 font-medium border border-green-500/20'
                                                                    : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                                                    }`}
                                                            >
                                                                {['A', 'B', 'C', 'D'][idx]}. {opt}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <button className="btn btn-primary w-full text-sm">
                                                Take Full Quiz
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats */}
                    <div className="card gradient-border p-[1px]">
                        <div className="bg-[var(--bg-secondary)] p-5 rounded-[var(--radius-xl)]">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-500" />
                                Your Magic Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[var(--bg-tertiary)] p-3 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-[var(--primary-500)]">48</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Notes Generated</p>
                                </div>
                                <div className="bg-[var(--bg-tertiary)] p-3 rounded-xl text-center">
                                    <p className="text-2xl font-bold text-[var(--accent-500)]">12h</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Time Saved</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notes */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">Recent Library</h3>
                            <button className="text-xs text-[var(--primary-400)] hover:underline">View All</button>
                        </div>
                        <div className="space-y-3">
                            {savedNotes.map((note) => (
                                <div
                                    key={note.id}
                                    className="p-3 rounded-xl cursor-pointer transition-all hover:bg-[var(--bg-tertiary)] hover:translate-x-1 group border border-transparent hover:border-[var(--border-primary)]"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-${note.color}-500/10 text-${note.color}-500`}>
                                            {note.source.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-[var(--text-tertiary)]">{note.date}</span>
                                    </div>
                                    <p className="font-semibold text-sm mb-1 group-hover:text-[var(--primary-500)] transition-colors">
                                        {note.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                                        <span className="flex items-center gap-1">
                                            <ListChecks size={12} /> {note.keyPoints} points
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> 5m read
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
