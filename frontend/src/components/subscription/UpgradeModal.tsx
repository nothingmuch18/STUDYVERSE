
import { useState } from 'react';
import { X, Check, Zap } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { paymentsApi } from '../../lib/api';

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    // const [isSuccess, setIsSuccess] = useState(false);

    const handleUpgrade = async () => {
        try {
            setIsProcessing(true);
            const { data } = await paymentsApi.createCheckoutSession();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error('No checkout URL returned');
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Failed to start checkout:', error);
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-surface-0)] w-[90%] max-w-md rounded-2xl shadow-2xl border border-[var(--accent-primary)] p-6 relative animate-in zoom-in-0 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--accent-primary)]">
                        <Zap size={32} fill="currentColor" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Upgrade to Pro</h2>
                    <p className="text-[var(--text-secondary)]">Unlock your full potential with advanced features.</p>
                </div>

                <div className="space-y-4 mb-8">
                    <FeatureRow text="Unlimited Habits & Tasks" />
                    <FeatureRow text="Advanced Analytics & AI Insights" />
                    <FeatureRow text="Unlimited Study Groups" />
                    <FeatureRow text="Custom Themes & Badges" />
                </div>

                <button
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white font-bold text-lg shadow-lg hover:brightness-110 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>Processing...</>
                    ) : (
                        "Upgrade Now - $4.99/mo"
                    )}
                </button>
                <p className="text-center text-xs text-[var(--text-tertiary)] mt-3">
                    Cancel anytime. Secure payment via Stripe.
                </p>
            </div>
        </div>
    );
}

function FeatureRow({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 text-[var(--text-primary)]">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                <Check size={12} strokeWidth={3} />
            </div>
            <span className="font-medium">{text}</span>
        </div>
    );
}
