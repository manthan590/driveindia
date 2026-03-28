/**
 * Utility Functions
 * Common helpers and utilities
 */

// Toast Notifications
class Toast {
    static show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        return toast;
    }

    static getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    static success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration = 3000) {
        return this.show(message, 'error', duration);
    }

    static info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    static warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }
}

// Loading Spinner
class Spinner {
    static show() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    }

    static hide() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }
}

// Format Utilities
const formatUtils = {
    // Format currency to INR
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Format date with time
    formatDateTime: (date) => {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Get day name from date
    getDayName: (date) => {
        return new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(new Date(date));
    },

    // Calculate days between dates
    calculateDays: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },

    // Get month name
    getMonthName: (month) => {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }
};

// Validation Utilities
const validateUtils = {
    // Email validation
    isValidEmail: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Phone validation (Indian format)
    isValidPhone: (phone) => {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(phone.replace(/\D/g, ''));
    },

    // Aadhaar validation (12 digits)
    isValidAadhaar: (aadhaar) => {
        return /^\d{12}$/.test(aadhaar.replace(/\s/g, ''));
    },

    // Driving License validation
    isValidLicense: (license) => {
        return license.length >= 5;
    },

    // Password validation
    isValidPassword: (password) => {
        return password.length >= 6;
    }
};

// Storage Utilities
const storageUtils = {
    // Set user session
    setUserSession: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Get user session
    getUserSession: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Clear user session
    clearUserSession: () => {
        localStorage.removeItem('user');
        api.removeToken();
    },

    // Check if logged in
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    }
};

// DOM Utilities
const domUtils = {
    // Get element by ID
    $: (id) => document.getElementById(id),

    // Query selector all
    $$: (selector) => document.querySelectorAll(selector),

    // Create element
    createElement: (tag, className = '', innerHTML = '') => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },

    // Show/Hide element
    show: (element) => {
        if (element) element.classList.remove('hidden');
    },

    hide: (element) => {
        if (element) element.classList.add('hidden');
    },

    toggle: (element) => {
        if (element) element.classList.toggle('hidden');
    },

    // Add/Remove class
    addClass: (element, className) => {
        if (element) element.classList.add(className);
    },

    removeClass: (element, className) => {
        if (element) element.classList.remove(className);
    },

    // Get all form data
    getFormData: (formElement) => {
        const formData = new FormData(formElement);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    },

    // Clear form
    clearForm: (formElement) => {
        formElement.reset();
    }
};

// Date Utilities
const dateUtils = {
    // Get current date
    now: () => new Date(),

    // Get today's date string
    today: () => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    },

    // Get date string from date object
    toDateString: (date) => {
        return date.toISOString().split('T')[0];
    },

    // Add days to date
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // Check if date is in past
    isPastDate: (date) => {
        return new Date(date) < new Date(dateUtils.today());
    },

    // Check if dates overlap
    datesOverlap: (start1, end1, start2, end2) => {
        return !(new Date(end1) < new Date(start2) || new Date(start1) > new Date(end2));
    }
};

// Theme Management
class ThemeManager {
    static init() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
        }
    }

    static toggle() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.updateIcon();
    }

    static updateIcon() {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            const isDark = document.body.classList.contains('dark-mode');
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    static isDarkMode() {
        return document.body.classList.contains('dark-mode');
    }
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});
