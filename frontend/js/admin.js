/**
 * Admin Module
 * Admin dashboard, vehicle management, booking management
 */

class AdminModule {
    constructor() {
        this.stats = null;
        this.vehicles = [];
        this.bookings = [];
    }

    async loadDashboard() {
        try {
            Spinner.show();
            const response = await api.admin.getDashboard();
            this.stats = response.data;
            this.renderDashboard();
            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load admin dashboard');
            Spinner.hide();
        }
    }

    renderDashboard() {
        const adminDashboard = document.getElementById('adminDashboard');
        if (!adminDashboard || !this.stats) return;

        adminDashboard.innerHTML = `
            <div style="animation: fadeIn 0.3s ease-in-out;">
                <h2 style="margin-bottom: 32px;"><i class="fas fa-chart-line"></i> Admin Dashboard</h2>

                <!-- Statistics Cards -->
                <div class="grid grid-4" style="margin-bottom: 32px;">
                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <p style="color: var(--text-tertiary); font-size: 0.9rem; margin: 0;">Total Users</p>
                                <h3 style="color: var(--primary); margin: 8px 0 0 0;">${this.stats.totalUsers}</h3>
                            </div>
                            <i class="fas fa-users" style="font-size: 2rem; color: var(--primary); opacity: 0.3;"></i>
                        </div>
                    </div>

                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <p style="color: var(--text-tertiary); font-size: 0.9rem; margin: 0;">Total Bookings</p>
                                <h3 style="color: var(--secondary); margin: 8px 0 0 0;">${this.stats.totalBookings}</h3>
                            </div>
                            <i class="fas fa-calendar-check" style="font-size: 2rem; color: var(--secondary); opacity: 0.3;"></i>
                        </div>
                    </div>

                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <p style="color: var(--text-tertiary); font-size: 0.9rem; margin: 0;">Total Vehicles</p>
                                <h3 style="color: var(--success); margin: 8px 0 0 0;">${this.stats.totalVehicles}</h3>
                            </div>
                            <i class="fas fa-car" style="font-size: 2rem; color: var(--success); opacity: 0.3;"></i>
                        </div>
                    </div>

                    <div class="card">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <p style="color: var(--text-tertiary); font-size: 0.9rem; margin: 0;">Total Revenue</p>
                                <h3 style="color: var(--info); margin: 8px 0 0 0;">${formatUtils.formatCurrency(this.stats.totalRevenue)}</h3>
                            </div>
                            <i class="fas fa-rupee-sign" style="font-size: 2rem; color: var(--info); opacity: 0.3;"></i>
                        </div>
                    </div>
                </div>

                <!-- Status Overview -->
                <div class="grid grid-3">
                    <div class="card">
                        <div class="card-header">
                            <h5 style="margin: 0;">Pending Bookings</h5>
                            <span class="badge badge-warning">${this.stats.pendingBookings}</span>
                        </div>
                        <p style="margin: 12px 0 0 0; color: var(--text-secondary);">Awaiting payment</p>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h5 style="margin: 0;">Completed Bookings</h5>
                            <span class="badge badge-success">${this.stats.completedBookings}</span>
                        </div>
                        <p style="margin: 12px 0 0 0; color: var(--text-secondary);">Successfully completed</p>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h5 style="margin: 0;">Active Vehicles</h5>
                            <span class="badge badge-info">${this.stats.totalVehicles}</span>
                        </div>
                        <p style="margin: 12px 0 0 0; color: var(--text-secondary);">Fleet management</p>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div style="display: flex; gap: 12px; margin-top: 32px; flex-wrap: wrap;">
                    <button class="btn btn-primary" id="addVehicleBtn">
                        <i class="fas fa-plus"></i> Add Vehicle
                    </button>
                    <button class="btn btn-secondary" id="manageVehiclesBtn">
                        <i class="fas fa-list"></i> Manage Vehicles
                    </button>
                    <button class="btn btn-outline" id="managBookingsBtn">
                        <i class="fas fa-clipboard-list"></i> Manage Bookings
                    </button>
                </div>
            </div>
        `;

        this.attachDashboardListeners();
    }

    attachDashboardListeners() {
        document.getElementById('addVehicleBtn')?.addEventListener('click', () => {
            app.showAddVehicleForm();
        });

        document.getElementById('manageVehiclesBtn')?.addEventListener('click', () => {
            app.showPage('adminVehicles');
            this.loadVehicles();
        });

        document.getElementById('managBookingsBtn')?.addEventListener('click', () => {
            app.showPage('adminBookings');
            this.loadBookings();
        });
    }

    async loadVehicles() {
        try {
            Spinner.show();
            const response = await api.admin.getAllVehicles();
            this.vehicles = response.data;
            this.renderVehiclesList();
            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load vehicles');
            Spinner.hide();
        }
    }

    renderVehiclesList() {
        const adminVehicles = document.getElementById('adminVehicles');
        if (!adminVehicles) return;

        const vehiclesTableHtml = this.vehicles.map(v => `
            <tr>
                <td style="padding: 12px;">${v.id}</td>
                <td style="padding: 12px;"><strong>${v.name}</strong></td>
                <td style="padding: 12px;"><span class="badge badge-info">${v.type}</span></td>
                <td style="padding: 12px;">${formatUtils.formatCurrency(v.price_per_day)}</td>
                <td style="padding: 12px;">${v.location}</td>
                <td style="padding: 12px;">
                    <span class="badge ${v.availability_status ? 'badge-success' : 'badge-danger'}">
                        ${v.availability_status ? 'Available' : 'Unavailable'}
                    </span>
                </td>
                <td style="padding: 12px;">
                    <button class="btn btn-small btn-outline edit-vehicle" data-vehicle-id="${v.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger delete-vehicle" data-vehicle-id="${v.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        adminVehicles.innerHTML = `
            <div style="animation: fadeIn 0.3s ease-in-out;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2>Manage Vehicles</h2>
                    <button class="btn btn-primary" id="addVehicleBtnTable">
                        <i class="fas fa-plus"></i> Add Vehicle
                    </button>
                </div>

                <div class="card">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--bg-secondary);">
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">ID</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Name</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Type</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Price/Day</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Location</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Status</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vehiclesTableHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.attachVehiclesListeners();
    }

    attachVehiclesListeners() {
        document.getElementById('addVehicleBtnTable')?.addEventListener('click', () => {
            app.showAddVehicleForm();
        });

        document.querySelectorAll('.delete-vehicle').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this vehicle?')) {
                    await this.deleteVehicle(btn.dataset.vehicleId);
                }
            });
        });

        document.querySelectorAll('.edit-vehicle').forEach(btn => {
            btn.addEventListener('click', () => {
                const vehicleId = btn.dataset.vehicleId;
                app.showEditVehicleForm(vehicleId);
            });
        });
    }

    async deleteVehicle(vehicleId) {
        try {
            Spinner.show();
            const response = await api.admin.deleteVehicle(vehicleId);

            if (response.success) {
                Toast.success('Vehicle deleted successfully');
                this.loadVehicles();
            }
        } catch (error) {
            Toast.error('Failed to delete vehicle');
        } finally {
            Spinner.hide();
        }
    }

    async loadBookings() {
        try {
            Spinner.show();
            const response = await api.admin.getAllBookings();
            this.bookings = response.data;
            this.renderBookingsList();
            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load bookings');
            Spinner.hide();
        }
    }

    renderBookingsList() {
        const adminBookings = document.getElementById('adminBookings');
        if (!adminBookings) return;

        const bookingsTableHtml = this.bookings.map(b => `
            <tr>
                <td style="padding: 12px;">${b.id}</td>
                <td style="padding: 12px;"><strong>${b.user_name || 'N/A'}</strong></td>
                <td style="padding: 12px;">${b.vehicle_name}</td>
                <td style="padding: 12px;">${formatUtils.formatDate(b.start_date)}</td>
                <td style="padding: 12px;">${formatUtils.formatDate(b.end_date)}</td>
                <td style="padding: 12px;">${formatUtils.formatCurrency(b.total_amount)}</td>
                <td style="padding: 12px;">
                    <span class="badge ${this.getStatusBadgeClass(b.status)}">${b.status}</span>
                </td>
            </tr>
        `).join('');

        adminBookings.innerHTML = `
            <div style="animation: fadeIn 0.3s ease-in-out;">
                <h2 style="margin-bottom: 24px;">Manage Bookings</h2>

                <div class="card">
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--bg-secondary);">
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">ID</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Customer</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Vehicle</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Check-in</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Check-out</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Amount</th>
                                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color);">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${bookingsTableHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    getStatusBadgeClass(status) {
        const classes = {
            'Pending': 'badge-warning',
            'Confirmed': 'badge-success',
            'Ongoing': 'badge-info',
            'Completed': 'badge-secondary',
            'Cancelled': 'badge-danger'
        };
        return classes[status] || 'badge-secondary';
    }
}

// Global admin module instance
const adminModule = new AdminModule();
