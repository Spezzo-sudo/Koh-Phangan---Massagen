import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'processing' | 'success' | 'error' | 'idle';
    error?: string;
    successMessage?: string;
}

export default function PaymentModal({ isOpen, onClose, status, error, successMessage }: PaymentModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in">

                {status === 'processing' && (
                    <div className="py-8">
                        <Loader2 size={48} className="animate-spin text-brand-teal mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
                        <p className="text-gray-500">Please wait while we secure your booking...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                        <p className="text-gray-500 mb-6">{successMessage || "Your transaction has been completed."}</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-brand-teal text-white py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <XCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h3>
                        <p className="text-red-500 mb-6">{error || "Something went wrong. Please try again."}</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
