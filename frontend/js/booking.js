/**
 * Booking Module
 * Handle booking creation and management
 */

class BookingModule {
    constructor() {
        this.currentVehicle = null;
        this.bookings = [];
        this.calendar = null;
    }

    async loadBookings() {
        try {
            Spinner.show();
            const response = await api.bookings.getAll();
            this.bookings = response.data;
            this.renderBookingsList();
            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load bookings');
            Spinner.hide();
        }
    }

    async showBookingDetails(bookingId) {
        try {
            Spinner.show();
            const response = await api.bookings.getById(bookingId);
            this.renderBookingDetails(response.data);
            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load booking details');
            Spinner.hide();
        }
    }

    renderBookingsList() {
        const userDashboard = document.getElementById('userDashboard');
        if (!userDashboard) return;

        const bookingsHtml = this.bookings.length > 0
            ? this.bookings.map(b => Components.bookingCard(b)).join('')
            : `<div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-tertiary); margin-bottom: 16px; display: block;"></i>
                <h3>No bookings yet</h3>
                <p style="color: var(--text-secondary); margin-bottom: 24px;">Start your journey by browsing and booking vehicles</p>
                <button class="btn btn-primary" id="browseVehiclesBtn">
                    <i class="fas fa-search"></i> Browse Vehicles
                </button>
            </div>`;

        userDashboard.innerHTML = `
            <div style="animation: fadeIn 0.3s ease-in-out;">
                <h2 style="margin-bottom: 32px;">My Bookings</h2>
                <div class="grid grid-2">
                    ${bookingsHtml}
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderBookingDetails(booking) {
        const bookingDetails = document.getElementById('bookingDetails');
        if (!bookingDetails) return;

        const totalAmount = formatUtils.formatCurrency(booking.total_amount);
        const basePrice = formatUtils.formatCurrency(booking.base_price);
        const gstAmount = formatUtils.formatCurrency(booking.gst_amount);
        const securityDeposit = formatUtils.formatCurrency(booking.security_deposit || 0);
        const startDate = formatUtils.formatDate(booking.start_date);
        const endDate = formatUtils.formatDate(booking.end_date);

        const statusBadgeClass = {
            'Pending': 'badge-warning',
            'Confirmed': 'badge-success',
            'Ongoing': 'badge-info',
            'Completed': 'badge-secondary',
            'Cancelled': 'badge-danger'
        }[booking.status] || 'badge-secondary';

        bookingDetails.innerHTML = `
            <div style="animation: fadeIn 0.3s ease-in-out;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <h2>Booking #${booking.id}</h2>
                    <span class="badge ${statusBadgeClass}">${booking.status}</span>
                </div>

                <div class="grid grid-2">
                    <!-- Booking Details -->
                    <div class="card">
                        <div class="card-header">
                            <h4 style="margin: 0;">Booking Information</h4>
                        </div>
                        <div class="card-body">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem; text-transform: uppercase;">Check-in</p>
                                    <p style="font-weight: 600;">${startDate}</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem; text-transform: uppercase;">Check-out</p>
                                    <p style="font-weight: 600;">${endDate}</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem; text-transform: uppercase;">Duration</p>
                                    <p style="font-weight: 600;">${booking.total_days} days</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem; text-transform: uppercase;">Location</p>
                                    <p style="font-weight: 600;">${booking.pickup_location}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Vehicle Details -->
                    <div class="card">
                        <div class="card-header">
                            <h4 style="margin: 0;">Vehicle Details</h4>
                        </div>
                        <div class="card-body">
                            <div style="margin-bottom: 12px;">
                                <p style="margin: 0; color: var(--text-tertiary); font-size: 0.9rem;">Vehicle Name</p>
                                <p style="margin: 4px 0; font-weight: 600;">${booking.vehicle_name}</p>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <p style="margin: 0; color: var(--text-tertiary); font-size: 0.9rem;">Type</p>
                                <p style="margin: 4px 0; font-weight: 600;">${booking.vehicle_type}</p>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <p style="margin: 0; color: var(--text-tertiary); font-size: 0.9rem;">Price per Day</p>
                                <p style="margin: 4px 0; font-weight: 600;">${formatUtils.formatCurrency(booking.price_per_day)}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Pricing Breakdown -->
                    <div class="card">
                        <div class="card-header">
                            <h4 style="margin: 0;">Price Breakdown</h4>
                        </div>
                        <div class="card-body">
                            <div style="display: grid; gap: 12px;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span>Base Price (${booking.total_days} days × ${formatUtils.formatCurrency(booking.price_per_day)}):</span>
                                    <span style="font-weight: 600;">${basePrice}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--border-color);">
                                    <span>GST (18%):</span>
                                    <span style="font-weight: 600;">${gstAmount}</span>
                                </div>
                                ${booking.security_deposit ? `
                                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px solid var(--border-color);">
                                    <span>Security Deposit (refundable):</span>
                                    <span style="font-weight: 600; color: var(--syntax-orange);">${securityDeposit}</span>
                                </div>
                                ` : ''}
                                <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; padding-top: 12px; border-top: 2px solid var(--border-color); color: var(--primary);">
                                    <span>Total Amount:</span>
                                    <span>${totalAmount}</span>
                                </div>
                                ${booking.security_deposit ? `
                                <div style="display: flex; justify-content: space-between; padding-top: 8px; font-size: 0.85rem;">
                                    <span style="color: var(--text-tertiary);">Deposit Status:</span>
                                    <span class="badge badge-${booking.deposit_status === 'refunded' ? 'success' : booking.deposit_status === 'forfeited' ? 'danger' : 'warning'}">${(booking.deposit_status || 'pending').toUpperCase()}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- User Details -->
                    <div class="card">
                        <div class="card-header">
                            <h4 style="margin: 0;">Passenger Details</h4>
                        </div>
                        <div class="card-body">
                            <div style="margin-bottom: 12px;">
                                <p style="margin: 0; color: var(--text-tertiary); font-size: 0.9rem;">Name</p>
                                <p style="margin: 4px 0; font-weight: 600;">${booking.full_name}</p>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <p style="margin: 0; color: var(--text-tertiary); font-size: 0.9rem;">Email</p>
                                <p style="margin: 4px 0; font-weight: 600;">${booking.email}</p>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <p style="margin: 0; color: var(--text-tertiary); font-size: 0.9rem;">Phone</p>
                                <p style="margin: 4px 0; font-weight: 600;">${booking.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 12px; margin-top: 24px;">
                    ${booking.status === 'Pending' ? `
                        <button class="btn btn-primary" id="payNowBtn" data-booking-id="${booking.id}">
                            <i class="fas fa-credit-card"></i> Pay Now
                        </button>
                    ` : ''}
                    ${booking.status !== 'Completed' && booking.status !== 'Cancelled' ? `
                        <button class="btn btn-danger" id="cancelBookingBtn" data-booking-id="${booking.id}">
                            <i class="fas fa-times"></i> Cancel Booking
                        </button>
                    ` : ''}
                    <button class="btn btn-outline" id="backToBookingsBtn">
                        <i class="fas fa-arrow-left"></i> Back to Bookings
                    </button>
                </div>
            </div>
        `;

        this.attachBookingDetailsListeners(booking.id);
    }

    attachEventListeners() {
        // Browse vehicles button
        document.getElementById('browseVehiclesBtn')?.addEventListener('click', () => {
            app.showPage('vehiclesBrowse');
        });

        // View booking details
        document.querySelectorAll('.view-booking-details').forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.dataset.bookingId;
                this.showBookingDetails(bookingId);
                app.showPage('bookingDetails');
            });
        });

        // Pay now button
        document.querySelectorAll('.pay-now').forEach(btn => {
            btn.addEventListener('click', () => {
                const bookingId = btn.dataset.bookingId;
                app.showPaymentPage(bookingId);
            });
        });

        // Cancel booking
        document.querySelectorAll('.cancel-booking').forEach(btn => {
            btn.addEventListener('click', async () => {
                const bookingId = btn.dataset.bookingId;
                if (confirm('Are you sure you want to cancel this booking?')) {
                    await this.cancelBooking(bookingId);
                }
            });
        });
    }

    attachBookingDetailsListeners(bookingId) {
        document.getElementById('payNowBtn')?.addEventListener('click', () => {
            app.showPaymentPage(bookingId);
        });

        document.getElementById('cancelBookingBtn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to cancel this booking?')) {
                await this.cancelBooking(bookingId);
            }
        });

        document.getElementById('backToBookingsBtn')?.addEventListener('click', () => {
            app.showPage('userDashboard');
            this.loadBookings();
        });
    }

    async cancelBooking(bookingId) {
        try {
            Spinner.show();
            const response = await api.bookings.cancel(bookingId);

            if (response.success) {
                Toast.success('Booking cancelled successfully');
                this.loadBookings();
                app.showPage('userDashboard');
            }
        } catch (error) {
            Toast.error('Failed to cancel booking');
        } finally {
            Spinner.hide();
        }
    }
}

// Global booking module instance
const bookingModule = new BookingModule();
