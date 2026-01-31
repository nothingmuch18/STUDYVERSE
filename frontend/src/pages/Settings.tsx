
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Bell, Moon, LogOut } from 'lucide-react';

export function Settings() {
    const { user, logout } = useAuth();

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
                <p className="text-[var(--text-secondary)] mt-1">Manage your account and preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="card-modern p-0 overflow-hidden">
                <div className="p-6 border-b border-[var(--border-subtle)] flex items-center gap-4 bg-[var(--bg-surface-2)]">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-primary)]">{user?.name}</h2>
                        <p className="text-[var(--text-secondary)]">{user?.email}</p>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between group cursor-pointer hover:bg-[var(--bg-surface-1)] p-2 rounded-lg -mx-2 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                <User size={20} />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--text-primary)]">Edit Profile</div>
                                <div className="text-sm text-[var(--text-secondary)]">Change your name and avatar</div>
                            </div>
                        </div>
                        <button className="text-sm font-medium text-[var(--accent-primary)]">Edit</button>
                    </div>

                    <div className="flex items-center justify-between group cursor-pointer hover:bg-[var(--bg-surface-1)] p-2 rounded-lg -mx-2 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                <Bell size={20} />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--text-primary)]">Notifications</div>
                                <div className="text-sm text-[var(--text-secondary)]">Customize your alerts</div>
                            </div>
                        </div>
                        <div className="h-6 w-11 bg-[var(--accent-primary)] rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between group cursor-pointer hover:bg-[var(--bg-surface-1)] p-2 rounded-lg -mx-2 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="font-medium text-[var(--text-primary)]">Security</div>
                                <div className="text-sm text-[var(--text-secondary)]">Password and 2FA</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="card-modern p-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Appearance</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                            <Moon size={20} />
                        </div>
                        <div>
                            <div className="font-medium text-[var(--text-primary)]">Dark Mode</div>
                            <div className="text-sm text-[var(--text-secondary)]">Toggled automatically based on system</div>
                        </div>
                    </div>
                    <span className="text-sm text-[var(--text-tertiary)]">System</span>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="card-modern p-6 border border-red-500/20">
                <h3 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h3>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-medium w-full justify-center"
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </div>
    );
}
