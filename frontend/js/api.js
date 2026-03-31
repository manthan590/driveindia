/**
 * API Service Module
 * Handles all backend API calls
 */

const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : window.location.origin + '/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    // Get authorization headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    // Generic fetch method
    async request(method, endpoint, data = null, includeAuth = true) {
        try {
            const options = {
                method,
                headers: this.getHeaders(includeAuth)
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();

            if (!response.ok) {
                // Auto-logout only on 401 (unauthorized/expired token)
                if (response.status === 401 && includeAuth) {
                    this.removeToken();
                    localStorage.removeItem('user');
                    window.location.reload();
                    return;
                }
                throw new Error(result.message || 'API request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth Endpoints
    auth = {
        register: (userData) => this.request('POST', '/auth/register', userData, false),
        login: (emailOrPhone, password) => 
            this.request('POST', '/auth/login', { email_or_phone: emailOrPhone, password }, false),
        getProfile: () => this.request('GET', '/auth/profile'),
        updateProfile: (data) => this.request('PUT', '/auth/profile', data),
        changePassword: (data) => this.request('PUT', '/auth/change-password', data),
        uploadPhoto: (formData) => this.requestFormData('POST', '/auth/upload-photo', formData),
        verifyAadhaar: (aadhaar_number) => this.request('POST', '/auth/verify-aadhaar', { aadhaar_number }),
        uploadDocument: (formData) => this.requestFormData('POST', '/auth/upload-document', formData),
        submitKYC: () => this.request('POST', '/auth/submit-kyc'),
        forgotPassword: (data) => this.request('POST', '/auth/forgot-password', data, false)
    };

    // Subscription Endpoints
    subscriptions = {
        getPlans: () => this.request('GET', '/subscriptions/plans', null, false),
        createOrder: (data) => this.request('POST', '/subscriptions/create-order', data),
        verify: (data) => this.request('POST', '/subscriptions/verify', data),
        getMy: () => this.request('GET', '/subscriptions/my-subscription'),
        cancel: () => this.request('PUT', '/subscriptions/cancel')
    };

    // Vehicle Endpoints
    vehicles = {
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters);
            return this.request('GET', `/vehicles?${params}`, null, false);
        },
        getById: (vehicleId) => this.request('GET', `/vehicles/${vehicleId}`, null, false),
        getAvailableDates: (vehicleId, month, year) => {
            let url = `/vehicles/${vehicleId}/available-dates`;
            if (month !== undefined && year !== undefined) {
                url += `?month=${month}&year=${year}`;
            }
            return this.request('GET', url, null, false);
        },
        getLocations: () => this.request('GET', '/vehicles/locations', null, false)
    };

    // Booking Endpoints
    bookings = {
        create: (bookingData) => this.request('POST', '/bookings', bookingData),
        getAll: () => this.request('GET', '/bookings'),
        getById: (bookingId) => this.request('GET', `/bookings/${bookingId}`),
        cancel: (bookingId) => this.request('PUT', `/bookings/${bookingId}/cancel`)
    };

    // Payment Endpoints
    payments = {
        getKey: () => this.request('GET', '/payments/key', null, false),
        createOrder: (data) => this.request('POST', '/payments/create-order', data),
        verify: (data) => this.request('POST', '/payments/verify', data),
        getHistory: () => this.request('GET', '/payments/history')
    };

    // Admin Endpoints
    admin = {
        getDashboard: () => this.request('GET', '/admin/dashboard'),
        getAllVehicles: () => this.request('GET', '/admin/vehicles'),
        addVehicle: (formData) => this.requestFormData('POST', '/admin/vehicles', formData),
        editVehicle: (vehicleId, formData) => this.requestFormData('PUT', `/admin/vehicles/${vehicleId}`, formData),
        deleteVehicle: (vehicleId) => this.request('DELETE', `/admin/vehicles/${vehicleId}`),
        getAllBookings: (filters = {}) => {
            const params = new URLSearchParams(filters);
            return this.request('GET', `/admin/bookings?${params}`);
        },
        getKYCApplications: (status) => {
            const params = status ? `?status=${status}` : '';
            return this.request('GET', `/admin/kyc-applications${params}`);
        },
        updateKYCStatus: (userId, data) => this.request('PUT', `/admin/kyc/${userId}`, data)
    };

    // FormData request (for file uploads — no Content-Type header, browser sets multipart boundary)
    async requestFormData(method, endpoint, formData) {
        try {
            const headers = {};
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method,
                headers,
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                if ((response.status === 401 || response.status === 403)) {
                    this.removeToken();
                    localStorage.removeItem('user');
                    window.location.reload();
                    return;
                }
                throw new Error(result.message || 'API request failed');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Global API instance
const api = new ApiService();
