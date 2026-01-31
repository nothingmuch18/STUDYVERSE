
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export function PaymentSuccess() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyPayment = async () => {
            // In a real app, you might want to call an endpoint to confirm status immediately
            // or just wait for webhook. We'll wait a bit and refresh user profile.
            setTimeout(() => {
                setIsLoading(false); // Set loading to false after the "verification" period
                // Simple verify: reload window to fetch fresh user data from /me
                window.location.href = '/app/dashboard';
            }, 2000);
        };
        verifyPayment();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-surface-0)] p-4">
            <div className="card-modern max-w-md w-full text-center p-8 space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500">
                    <CheckCircle2 size={40} strokeWidth={3} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Payment Successful!</h1>
                    <p className="text-[var(--text-secondary)]">
                        Thank you for upgrading to Pro. Your account has been updated with all premium features.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center gap-2 text-[var(--text-tertiary)] text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Finalizing setup...
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/app/dashboard')}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        Go to Dashboard <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
