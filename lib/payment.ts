import { PaymentMethod } from '../types';

/**
 * Handles the logic for processing different payment methods.
 * In a real app, this would interact with Stripe/Omise APIs.
 */

export const processPayment = async (
    amount: number,
    method: PaymentMethod,
    metadata: { orderId?: string; bookingId?: string; customerEmail?: string }
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {

    console.log(`Processing ${method} payment for ${amount} THB`, metadata);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
        switch (method) {
            case 'cash':
                return { success: true, transactionId: `cash_${Date.now()}` };

            case 'transfer':
                // In reality, this would verify a slip upload or check bank API
                // For now, we assume the user will upload a slip later or it's manual verification
                return { success: true, transactionId: `transfer_${Date.now()}` };

            case 'card':
                // MOCK STRIPE PAYMENT
                // This is where you'd call stripe.confirmCardPayment()
                const isSuccess = Math.random() > 0.1; // 90% success rate for simulation
                if (isSuccess) {
                    return { success: true, transactionId: `ch_${Date.now()}_mock` };
                } else {
                    throw new Error('Card declined (Mock)');
                }

            default:
                throw new Error('Invalid payment method');
        }
    } catch (error: any) {
        console.error("Payment processing failed:", error);
        return { success: false, error: error.message || 'Payment failed' };
    }
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
        case 'cash': return 'Cash on Arrival';
        case 'transfer': return 'Bank Transfer / QR';
        case 'card': return 'Credit Card';
        default: return method;
    }
};
