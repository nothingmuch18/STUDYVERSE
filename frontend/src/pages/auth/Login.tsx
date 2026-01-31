import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const testNetwork = async () => {
        addLog('Testing Network...');
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const res = await fetch(`${apiUrl}/health`);
            const data = await res.json();
            addLog(`Network OK: ${JSON.stringify(data)}`);
        } catch (e: any) {
            addLog(`Network FAIL: ${e.message}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        addLog(`Attempting login for: ${email}`);

        try {
            addLog('Calling login()...');
            await login(email, password);
            addLog('Login success! Navigating...');
            navigate('/');
        } catch (err: any) {
            console.error('Login failed:', err);
            addLog(`Login error: ${err.message}`);
            setError(err.message || 'Failed to login');
        } finally {
            setIsLoading(false);
            addLog('Loading finished');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)] px-4">
            <div className="w-full max-w-md">
                {/* HEADERS */}
                <div className="bg-black text-green-400 p-4 rounded mb-4 font-mono text-xs h-40 overflow-auto border border-green-900">
                    <strong>LOGIN DEBUG LOG:</strong>
                    <button onClick={testNetwork} type="button" className="ml-2 px-2 py-1 bg-gray-700 rounded hover:bg-gray-600">TEST CONNECT</button>
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-ai)] bg-clip-text text-transparent mb-2">
                        StudyOS
                    </h1>
                    <p className="text-[var(--text-secondary)]">Welcome back, scholar.</p>
                </div>

                <div className="glass-panel p-8 rounded-2xl border border-[var(--border-subtle)]">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="p-2 bg-gray-800 rounded text-xs text-gray-400 font-mono">
                            API Target: {import.meta.env.VITE_API_URL || 'http://127.0.0.1:3002/api'}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg bg-[var(--bg-surface-1)] border border-[var(--border-element)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-[var(--text-tertiary)]">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[var(--accent-primary)] hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
