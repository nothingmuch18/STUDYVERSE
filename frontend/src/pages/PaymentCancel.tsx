
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export function PaymentCancel() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-surface-0)] p-4">
            <div className="card-modern max-w-md w-full text-center p-8 space-y-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <XCircle size={40} strokeWidth={3} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-[var(--text-primary)]">Payment Cancelled</h1>
                    <p className="text-[var(--text-secondary)]">
                        Your payment was not processed. No charges were made.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/app/dashboard')}
                        className="btn-ghost flex-1 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/app/subscription')}
                        className="btn-primary flex-1"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
