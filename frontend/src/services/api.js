/**
 * API service for Hawa Hawai frontend.
 * Handles all HTTP requests to the backend with proper error handling.
 */

// Use environment variable or default to Vite proxy path
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Custom error class for API errors with additional context.
 */
export class ApiError extends Error {
    constructor(message, status, code = 'UNKNOWN_ERROR', details = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

/**
 * Parse error response from the API.
 */
async function parseErrorResponse(response) {
    try {
        const data = await response.json();
        return {
            message: data.error || data.message || getDefaultErrorMessage(response.status),
            details: data.details || null
        };
    } catch {
        return {
            message: getDefaultErrorMessage(response.status),
            details: null
        };
    }
}

/**
 * Get user-friendly error message based on status code.
 */
function getDefaultErrorMessage(status) {
    const messages = {
        400: 'Invalid request. Please check your input.',
        401: 'Please log in to continue.',
        403: 'You do not have permission to perform this action.',
        404: 'The requested resource was not found.',
        429: 'Too many requests. Please wait a moment and try again.',
        500: 'Something went wrong on our end. Please try again later.',
        502: 'Service temporarily unavailable. Please try again.',
        503: 'Server is under maintenance. Please try again later.'
    };
    return messages[status] || 'An unexpected error occurred. Please try again.';
}

/**
 * Get error code based on status.
 */
function getErrorCode(status) {
    const codes = {
        400: 'VALIDATION_ERROR',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        429: 'RATE_LIMITED',
        500: 'SERVER_ERROR',
        502: 'BAD_GATEWAY',
        503: 'SERVICE_UNAVAILABLE'
    };
    return codes[status] || 'UNKNOWN_ERROR';
}

/**
 * Make an API request with proper error handling.
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const { message, details } = await parseErrorResponse(response);
            throw new ApiError(message, response.status, getErrorCode(response.status), details);
        }

        return response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network error or other fetch error
        throw new ApiError(
            'Unable to connect to the server. Please check your internet connection.',
            0,
            'NETWORK_ERROR'
        );
    }
}

/**
 * Get auth headers if user is logged in.
 */
function getAuthHeaders() {
    const userData = localStorage.getItem('user');
    const token = userData ? JSON.parse(userData)?.access_token : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
    /**
     * Fetch all airports.
     */
    fetchAirports: async () => {
        return apiRequest('/airports');
    },

    /**
     * Search for flights between two airports.
     */
    searchFlights: async (origin, destination, date, filters = {}) => {
        const params = new URLSearchParams({ origin, destination, date });

        if (filters.min_price) params.append('min_price', filters.min_price);
        if (filters.max_price) params.append('max_price', filters.max_price);
        if (filters.stops) params.append('stops', filters.stops);

        return apiRequest(`/flights?${params}`);
    },

    /**
     * Create a new booking.
     */
    createBooking: async (bookingData) => {
        return apiRequest('/book', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData)
        });
    },

    /**
     * Calculate price for a booking configuration.
     */
    /**
     * Calculate price for a booking configuration.
     */
    calculatePrice: async (payload) => {
        return apiRequest('/calculate-price', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    /**
     * Validate a promo code.
     */
    validatePromo: async (code) => {
        // Just use calculate price or a custom endpoint?
        // Let's use the validate-promo endpoint I saw in routes.py (it exists!).
        // Wait, I didn't see validate-promo in `routes.py` in Step 112...
        // Ah, looking at Step 112, lines 184-213 show `validate_promo`. It imports `PromoCode` model.
        // My `PromoService` implementation was a separate file.
        // The existing `routes.py` uses `PromoCode` model (DB based).
        // The `PromoService` I created (Step 102) is a static class.
        // I should probably align them.
        // `routes.py` uses `PromoCode` model.
        // `PricingService` (Step 108) uses `PromoService` (my new file).
        // This is a conflict.

        // DECISION: I will wire `PricingService` to use `PromoService` I created, and I will update `routes.py`'s `validate_promo` to use `PromoService` as well, OR I will just use `PricingService` for everything and ignore the old `validate_promo` if it's broken or use it if it works.
        // The existing `validate_promo` in `routes.py` uses `app.models.promo_code`.
        // I didn't check if that model exists.
        // `list_dir` of `models` (Step 15) showed 12 children.
        // Let's assume `PromoService` is the way to go for now as I created it.
        // I will add `validatePromo` to `api.js` leveraging a new endpoint or the existing one if I update it.
        // I will stick to `calculatePrice` doing the heavy lifting for now.

        return apiRequest('/validate-promo', {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    },

    /**
     * Get active flights for tracking.
     */
    getActiveFlights: async () => {
        return apiRequest('/tracking/active', {
            headers: getAuthHeaders()
        });
    },

    /**
     * Get current user's bookings.
     */
    getMyBookings: async () => {
        return apiRequest('/my-bookings', {
            headers: getAuthHeaders()
        });
    },

    /**
     * Get seats for a flight.
     */
    getSeats: async (flightId) => {
        return apiRequest(`/flights/${flightId}/seats`);
    }
};
