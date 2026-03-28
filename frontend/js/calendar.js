/**
 * Advanced Interactive Calendar System
 * With date range selection, booking visualization, and smooth animations
 */

class Calendar {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.currentDate = new Date();
        this.selectedStart = null;
        this.selectedEnd = null;
        this.bookedDates = options.bookedDates || [];
        this.onDateSelect = options.onDateSelect || null;
        this.vehicleId = options.vehicleId || null;
        this.selectMode = options.selectMode || 'range'; // 'single' or 'range'

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    // Render calendar
    render() {
        if (!this.container) return;

        const html = `
            <div class="calendar-wrapper">
                <div class="calendar-header">
                    <h3 class="calendar-title">
                        <i class="fas fa-calendar-alt"></i>
                        ${formatUtils.getMonthName(this.currentDate.getMonth())} ${this.currentDate.getFullYear()}
                    </h3>
                    <div class="calendar-nav">
                        <button class="btn-prev" title="Previous Month">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="btn-today" title="Go to Today">Today</button>
                        <button class="btn-next" title="Next Month">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <div class="calendar-grid">
                    ${this.renderWeekdays()}
                    ${this.renderDays()}
                </div>

                <div class="calendar-legend">
                    <div class="legend-item">
                        <div class="legend-color available"></div>
                        <span>Available</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color booked"></div>
                        <span>Booked</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color selected"></div>
                        <span>Selected</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color in-range"></div>
                        <span>In Range</span>
                    </div>
                </div>

                ${this.renderBookingSummary()}
            </div>
        `;

        this.container.innerHTML = html;
    }

    // Render weekday headers
    renderWeekdays() {
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('');
    }

    // Render calendar days
    renderDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);

        let daysHtml = '';

        // Previous month's days
        const prevDaysCount = firstDay.getDay();
        for (let i = prevDaysCount - 1; i >= 0; i--) {
            const day = prevLastDay.getDate() - i;
            daysHtml += `<div class="calendar-day empty">${day}</div>`;
        }

        // Current month's days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = dateUtils.toDateString(date);
            const dayClass = this.getDayClass(dateStr, date);

            daysHtml += `
                <div class="calendar-day ${dayClass}" data-date="${dateStr}" data-day="${day}">
                    ${day}
                </div>
            `;
        }

        // Next month's days
        const nextDaysCount = 42 - (prevDaysCount + lastDay.getDate());
        for (let day = 1; day <= nextDaysCount; day++) {
            daysHtml += `<div class="calendar-day empty">${day}</div>`;
        }

        return daysHtml;
    }

    // Get class for a day cell
    getDayClass(dateStr, date) {
        let classes = [];

        // Check if today
        if (dateStr === dateUtils.today()) {
            classes.push('today');
        }

        // Check if past date
        if (date < new Date(dateUtils.today())) {
            classes.push('disabled');
            return classes.join(' ');
        }

        // Check if booked
        if (this.bookedDates.includes(dateStr)) {
            classes.push('booked');
            return classes.join(' ');
        }

        // Check if selected
        if (dateStr === this.selectedStart || dateStr === this.selectedEnd) {
            classes.push('selected');
            if (dateStr === this.selectedStart) classes.push('range-start');
            if (dateStr === this.selectedEnd) classes.push('range-end');
        }

        // Check if in range
        if (this.selectedStart && this.selectedEnd) {
            const start = new Date(this.selectedStart);
            const end = new Date(this.selectedEnd);
            const current = new Date(dateStr);

            if (current > start && current < end) {
                classes.push('in-range');
            }
        }

        // If not booked, it's available
        if (!classes.includes('booked') && !classes.includes('disabled')) {
            classes.push('available');
        }

        return classes.join(' ');
    }

    // Render booking summary
    renderBookingSummary() {
        if (!this.selectedStart || !this.selectedEnd) {
            return '';
        }

        const days = formatUtils.calculateDays(this.selectedStart, this.selectedEnd);
        const startDate = formatUtils.formatDate(this.selectedStart);
        const endDate = formatUtils.formatDate(this.selectedEnd);

        return `
            <div class="booking-summary">
                <div class="summary-title">
                    <i class="fas fa-check-circle"></i>
                    Booking Summary
                </div>
                <div class="summary-details">
                    <div class="summary-item">
                        <span class="summary-item-label">Check-in:</span>
                        <span class="summary-item-value">${startDate}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-item-label">Check-out:</span>
                        <span class="summary-item-value">${endDate}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-item-label">Duration:</span>
                        <span class="summary-item-value">${days} days</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Attach event listeners
    attachEventListeners() {
        if (!this.container) return;

        // Day selection
        this.container.querySelectorAll('.calendar-day.available').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => this.selectDate(e));
        });

        // Month navigation
        this.container.querySelector('.btn-prev')?.addEventListener('click', () => this.previousMonth());
        this.container.querySelector('.btn-next')?.addEventListener('click', () => this.nextMonth());
        this.container.querySelector('.btn-today')?.addEventListener('click', () => this.goToToday());
    }

    // Select date handler
    selectDate(event) {
        const dateStr = event.target.dataset.date;

        if (!dateStr) return;

        // Check if booked
        if (event.target.classList.contains('booked')) {
            Toast.warning('This date is not available for booking');
            return;
        }

        if (this.selectMode === 'single') {
            this.selectedStart = dateStr;
            this.selectedEnd = null;
        } else {
            if (!this.selectedStart) {
                this.selectedStart = dateStr;
            } else if (!this.selectedEnd) {
                // If new end date is before start, swap them
                if (dateStr < this.selectedStart) {
                    this.selectedEnd = this.selectedStart;
                    this.selectedStart = dateStr;
                } else if (dateStr === this.selectedStart) {
                    this.selectedStart = null;
                    this.selectedEnd = null;
                } else {
                    this.selectedEnd = dateStr;
                }
            } else {
                // Reset and start new selection
                this.selectedStart = dateStr;
                this.selectedEnd = null;
            }
        }

        this.render();
        this.attachEventListeners();

        // Trigger callback
        if (this.onDateSelect && this.selectedStart && this.selectedEnd) {
            this.onDateSelect({
                startDate: this.selectedStart,
                endDate: this.selectedEnd,
                days: formatUtils.calculateDays(this.selectedStart, this.selectedEnd)
            });
        }
    }

    // Month navigation
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.attachEventListeners();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.attachEventListeners();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
        this.attachEventListeners();
    }

    // Set booked dates
    setBookedDates(dates) {
        this.bookedDates = dates;
        this.render();
        this.attachEventListeners();
    }

    // Get selected dates
    getSelectedDates() {
        if (!this.selectedStart || !this.selectedEnd) {
            return null;
        }

        return {
            startDate: this.selectedStart,
            endDate: this.selectedEnd,
            days: formatUtils.calculateDays(this.selectedStart, this.selectedEnd)
        };
    }

    // Clear selection
    clearSelection() {
        this.selectedStart = null;
        this.selectedEnd = null;
        this.render();
        this.attachEventListeners();
    }

    // Update calendar
    update(options = {}) {
        if (options.bookedDates) {
            this.bookedDates = options.bookedDates;
        }
        this.render();
        this.attachEventListeners();
    }
}

// Calendar helper function for easy creation
function createCalendar(containerId, options = {}) {
    return new Calendar(containerId, options);
}
