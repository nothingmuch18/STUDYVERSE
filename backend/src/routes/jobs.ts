
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const jobsRouter = Router();

jobsRouter.use(authMiddleware);

// GET /api/career/jobs
jobsRouter.get('/jobs', (req, res) => {
    // Mock Data for MVP
    const jobs = [
        {
            id: '1',
            title: 'Junior Frontend Developer',
            company: 'TechFlow',
            location: 'Remote',
            type: 'Internship',
            tags: ['React', 'TypeScript', 'Tailwind'],
            salary: '$20/hr',
            postedAt: new Date().toISOString(),
            applyUrl: '#'
        },
        {
            id: '2',
            title: 'Backend Engineer Intern',
            company: 'DataCorp',
            location: 'New York, NY',
            type: 'Internship',
            tags: ['Node.js', 'PostgreSQL', 'API'],
            salary: '$30/hr',
            postedAt: new Date(Date.now() - 86400000).toISOString(),
            applyUrl: '#'
        },
        {
            id: '3',
            title: 'AI Research Assistant',
            company: 'OpenMind',
            location: 'San Francisco, CA',
            type: 'Full-time',
            tags: ['Python', 'PyTorch', 'LLMs'],
            salary: '$120k/yr',
            postedAt: new Date(Date.now() - 172800000).toISOString(),
            applyUrl: '#'
        },
        {
            id: '4',
            title: 'UI/UX Designer',
            company: 'CreativeStudio',
            location: 'Remote',
            type: 'Contract',
            tags: ['Figma', 'Design Systems'],
            salary: '$50/hr',
            postedAt: new Date(Date.now() - 250000000).toISOString(),
            applyUrl: '#'
        }
    ];

    res.json(jobs);
});
