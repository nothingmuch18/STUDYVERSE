import { useState } from 'react';
import { FileText, Sparkles, CheckCircle, Upload } from 'lucide-react';
import { careerApi } from '../lib/api';
import { JobBoard } from '../components/career/JobBoard';

export function Career() {
    const [resumeText, setResumeText] = useState('');
    const [analysis, setAnalysis] = useState<{ score: number; suggestions: string[]; message: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<'JOBS' | 'RESUME'>('JOBS');

    /* Job loading logic moved to JobBoard component */

    const handleAnalyzeResume = async () => {
        if (!resumeText.trim()) return;
        setIsAnalyzing(true);
        try {
            const { data } = await careerApi.analyzeResume(resumeText);
            setAnalysis(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Career Center</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Find opportunities and optimize your profile.</p>
                </div>
                <div className="flex bg-[var(--bg-surface-2)] p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('JOBS')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'JOBS' ? 'bg-[var(--bg-surface-3)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'}`}
                    >
                        Job Board
                    </button>
                    <button
                        onClick={() => setActiveTab('RESUME')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'RESUME' ? 'bg-[var(--bg-surface-3)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'}`}
                    >
                        AI Resume Check
                    </button>
                </div>
            </div>


            {activeTab === 'JOBS' ? (
                <JobBoard />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Side */}
                    <div className="space-y-4">
                        <div className="p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-[var(--accent-primary)]" />
                                Paste Your Resume
                            </h3>
                            <textarea
                                value={resumeText}
                                onChange={e => setResumeText(e.target.value)}
                                className="w-full h-64 bg-[var(--bg-canvas)] border border-[var(--border-element)] rounded-lg p-4 text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                                placeholder="Paste your resume text here..."
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleAnalyzeResume}
                                    disabled={!resumeText || isAnalyzing}
                                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {isAnalyzing ? <Sparkles className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Side */}
                    <div className="space-y-4">
                        {analysis ? (
                            <div className="p-6 bg-[var(--bg-surface-1)] border border-[var(--border-subtle)] rounded-xl animate-up">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-white">AI Analysis Result</h3>
                                    <div className={`text-2xl font-bold ${analysis.score >= 80 ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                                        {analysis.score}/100
                                    </div>
                                </div>

                                <p className="text-[var(--text-primary)] mb-6 italic">"{analysis.message}"</p>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">Suggestions</h4>
                                    {analysis.suggestions.map((suggestion, i) => (
                                        <div key={i} className="flex gap-3 p-3 bg-[var(--bg-surface-2)] rounded-lg">
                                            <CheckCircle size={18} className="text-[var(--accent-secondary)] shrink-0 mt-0.5" />
                                            <p className="text-sm text-[var(--text-primary)]">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--border-subtle)] rounded-xl text-center text-[var(--text-tertiary)]">
                                <Upload size={48} className="mb-4 opacity-50" />
                                <p>Analysis results will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
