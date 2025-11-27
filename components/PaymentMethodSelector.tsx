import React from 'react';
import { Banknote, CreditCard, QrCode } from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod;
    onSelect: (method: PaymentMethod) => void;
    amount: number;
}

export default function PaymentMethodSelector({ selectedMethod, onSelect, amount }: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-800 mb-2">Select Payment Method</h3>

            <div className="grid grid-cols-1 gap-3">
                {/* Cash Option */}
                <button
                    type="button"
                    onClick={() => onSelect('cash')}
                    className={`flex items-center p-4 border rounded-xl transition-all ${selectedMethod === 'cash'
                            ? 'border-brand-teal bg-brand-light/20 ring-1 ring-brand-teal'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    <div className={`p-3 rounded-full mr-4 ${selectedMethod === 'cash' ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Banknote size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-gray-900">Cash on Arrival</div>
                        <div className="text-xs text-gray-500">Pay directly to the staff member</div>
                    </div>
                    {selectedMethod === 'cash' && <div className="w-4 h-4 rounded-full bg-brand-teal"></div>}
                </button>

                {/* Bank Transfer / QR */}
                <button
                    type="button"
                    onClick={() => onSelect('transfer')}
                    className={`flex items-center p-4 border rounded-xl transition-all ${selectedMethod === 'transfer'
                            ? 'border-brand-teal bg-brand-light/20 ring-1 ring-brand-teal'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    <div className={`p-3 rounded-full mr-4 ${selectedMethod === 'transfer' ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <QrCode size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-gray-900">Thai QR Payment</div>
                        <div className="text-xs text-gray-500">Scan QR code (PromptPay)</div>
                    </div>
                    {selectedMethod === 'transfer' && <div className="w-4 h-4 rounded-full bg-brand-teal"></div>}
                </button>

                {/* Credit Card (Stripe) */}
                <button
                    type="button"
                    onClick={() => onSelect('card')}
                    className={`flex items-center p-4 border rounded-xl transition-all ${selectedMethod === 'card'
                            ? 'border-brand-teal bg-brand-light/20 ring-1 ring-brand-teal'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    <div className={`p-3 rounded-full mr-4 ${selectedMethod === 'card' ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <CreditCard size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-gray-900">Credit Card</div>
                        <div className="text-xs text-gray-500">Secure payment via Stripe</div>
                    </div>
                    {selectedMethod === 'card' && <div className="w-4 h-4 rounded-full bg-brand-teal"></div>}
                </button>
            </div>

            {/* Dynamic Info Box based on Selection */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600">
                {selectedMethod === 'cash' && (
                    <p>You will pay <strong>{amount.toLocaleString()} THB</strong> in cash when the staff arrives. Please have exact change if possible.</p>
                )}
                {selectedMethod === 'transfer' && (
                    <div className="text-center">
                        <p className="mb-2">Scan to pay <strong>{amount.toLocaleString()} THB</strong></p>
                        {/* Placeholder QR - In real app, generate dynamic QR based on amount */}
                        <div className="w-32 h-32 bg-white border border-gray-200 mx-auto flex items-center justify-center mb-2">
                            <QrCode size={64} className="text-gray-800" />
                        </div>
                        <p className="text-xs text-gray-400">PromptPay ID: 081-234-5678</p>
                    </div>
                )}
                {selectedMethod === 'card' && (
                    <p>You will be redirected to a secure payment page to pay <strong>{amount.toLocaleString()} THB</strong>.</p>
                )}
            </div>
        </div>
    );
}
