import { ServiceCategory } from './types';

/**
 * Helper to get service image or fallback to premium assets.
 * This ensures no broken images appear across the app.
 */
export const getServiceImage = (service: { image?: string; category?: string | ServiceCategory }) => {
    if (service.image && (service.image.startsWith('http') || service.image.startsWith('/'))) {
        return service.image;
    }

    // Fallback based on category
    if (service.category === 'Nails') return '/nails_card.png';
    if (service.category === 'Packages') return '/hero_background.png'; // Use hero as fallback for packages for now
    return '/massage_card.png';
};

/**
 * Helper to format currency
 */
export const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount) + ' THB';
};
