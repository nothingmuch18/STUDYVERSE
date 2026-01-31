
import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Building, DollarSign, ExternalLink } from 'lucide-react';
import { jobsApi } from '../../lib/api';

export function JobBoard() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const loadJobs = async () => {
            try {
                const { data } = await jobsApi.getJobs();
                setJobs(data);
            } catch (error) {
                console.error("Failed to load jobs", error);
            }
        };
        loadJobs();
    }, []);

    const filteredJobs = filter === 'All' ? jobs : jobs.filter(j => j.type === filter);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="text-[var(--accent-primary)]" />
                    Student Opportunities
                </h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-[var(--bg-surface-2)] border border-[var(--border-element)] text-sm rounded-lg px-3 py-1.5 text-[var(--text-secondary)] outline-none"
                >
                    <option value="All">All Types</option>
                    <option value="Internship">Internships</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                </select>
            </div>

            <div className="grid gap-4">
                {filteredJobs.map(job => (
                    <div key={job.id} className="card-modern p-6 hover:border-[var(--accent-primary)]/50 transition-colors group">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                                    {job.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-1"><Building size={14} /> {job.company}</span>
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                    <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {job.tags.map((tag: string) => (
                                        <span key={tag} className="px-2 py-1 rounded text-xs font-medium bg-[var(--bg-surface-3)] text-[var(--text-tertiary)]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <a
                                href={job.applyUrl}
                                target="_blank"
                                className="btn-secondary text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                Apply <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
