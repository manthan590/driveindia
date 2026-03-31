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
                            <h5 style="margin: 0;">Active Subscriptions</h5>
                            <span class="badge badge-info">${this.stats.activeSubscriptions || 0}</span>
                        </div>
                        <p style="margin: 12px 0 0 0; color: var(--text-secondary);">Plan revenue: ${formatUtils.formatCurrency(this.stats.subscriptionRevenue || 0)}</p>
                    </div>
                </div>

                <!-- Recent Subscriptions -->
                ${this.stats.recentSubscriptions && this.stats.recentSubscriptions.length > 0 ? `
                <div class="card" style="margin-top: 24px;">
                    <div class="card-header">
                        <h5 style="margin: 0;"><i class="fas fa-crown" style="color: var(--syntax-yellow);"></i> Recent Plan Purchases</h5>
                    </div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--bg-secondary);">
                                    <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-size: 0.82rem;">User</th>
                                    <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-size: 0.82rem;">Plan</th>
                                    <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-size: 0.82rem;">Amount</th>
                                    <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-size: 0.82rem;">Txn ID</th>
                                    <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-size: 0.82rem;">Status</th>
                                    <th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-size: 0.82rem;">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.stats.recentSubscriptions.map(s => `
                                    <tr>
                                        <td style="padding: 10px 12px; font-size: 0.85rem;"><strong>${s.full_name}</strong><br><span style="color: var(--text-tertiary); font-size: 0.75rem;">${s.email}</span></td>
                                        <td style="padding: 10px 12px; font-size: 0.85rem;">${s.plan_name}</td>
                                        <td style="padding: 10px 12px; font-size: 0.85rem;">${formatUtils.formatCurrency(s.amount)}</td>
                                        <td style="padding: 10px 12px; font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;">${s.transaction_id || '—'}</td>
                                        <td style="padding: 10px 12px;"><span class="badge badge-${s.status === 'active' ? 'success' : s.status === 'expired' ? 'warning' : 'danger'}">${s.status}</span></td>
                                        <td style="padding: 10px 12px; font-size: 0.85rem;">${formatUtils.formatDate(s.created_at)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ''}

                <!-- Quick Actions -->
                <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
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

    // ---- KYC Verification Panel ----

    async loadKYCApplications() {
        try {
            Spinner.show();
            const response = await api.admin.getKYCApplications();
            this.kycApplications = response.data || [];
            this.renderKYCPanel();
            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load KYC applications');
            Spinner.hide();
        }
    }

    renderKYCPanel() {
        const adminKYC = document.getElementById('adminKYC');
        if (!adminKYC) return;

        const submitted = this.kycApplications.filter(u => u.kyc_status === 'submitted');
        const verified = this.kycApplications.filter(u => u.kyc_status === 'verified');
        const rejected = this.kycApplications.filter(u => u.kyc_status === 'rejected');

        const renderUserCard = (user) => {
            const badgeClass = { submitted: 'badge-warning', verified: 'badge-success', rejected: 'badge-danger' }[user.kyc_status] || 'badge-secondary';
            const baseUrl = window.location.origin;
            return `
                <div class="card" style="padding: 20px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--bg-tertiary); overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                            ${user.profile_photo 
                                ? `<img src="${baseUrl}${user.profile_photo}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\' style=\\'font-size:1.5rem;color:var(--text-tertiary)\\'></i>'">`
                                : `<i class="fas fa-user" style="font-size: 1.5rem; color: var(--text-tertiary);"></i>`}
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                                <h4 style="margin: 0; font-size: 1rem;">${user.full_name}</h4>
                                <span class="badge ${badgeClass}" style="font-size: 0.72rem;">${user.kyc_status.toUpperCase()}</span>
                            </div>
                            <p style="margin: 4px 0 0; color: var(--text-secondary); font-size: 0.82rem;">${user.email} &bull; ${user.phone}</p>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-top: 12px; font-size: 0.82rem;">
                                <div><span style="color: var(--text-tertiary);">DL:</span> <strong>${user.driving_license || '—'}</strong></div>
                                <div><span style="color: var(--text-tertiary);">Aadhaar:</span> <strong>${user.aadhaar_number ? 'XXXX-XXXX-' + user.aadhaar_number.slice(-4) : '—'}</strong></div>
                                <div><span style="color: var(--text-tertiary);">PAN:</span> <strong>${user.pan_number || '—'}</strong></div>
                                <div><span style="color: var(--text-tertiary);">Emergency:</span> <strong>${user.emergency_contact_name || '—'} (${user.emergency_contact_phone || '—'})</strong></div>
                            </div>
                            <div style="margin-top: 8px; font-size: 0.82rem;">
                                <span style="color: var(--text-tertiary);">Address:</span> <span>${user.address || '—'}</span>
                            </div>

                            <!-- Document Photos -->
                            <div style="display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap;">
                                ${['selfie_photo', 'dl_photo', 'aadhaar_photo', 'id_with_selfie_photo'].map(field => {
                                    const label = { selfie_photo: 'Selfie', dl_photo: 'DL Photo', aadhaar_photo: 'Aadhaar', id_with_selfie_photo: 'ID + Selfie' }[field];
                                    if (user[field]) {
                                        return `<a href="${baseUrl}${user[field]}" target="_blank" style="text-decoration:none;">
                                            <div style="width:70px;height:70px;border-radius:8px;overflow:hidden;border:2px solid var(--syntax-green);position:relative;">
                                                <img src="${baseUrl}${user[field]}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-file-image\\' style=\\'font-size:1.5rem;color:var(--text-tertiary);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)\\'></i>'">
                                                <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);padding:2px;text-align:center;font-size:0.6rem;color:#fff;">${label}</div>
                                            </div>
                                        </a>`;
                                    }
                                    return `<div style="width:70px;height:70px;border-radius:8px;border:2px dashed var(--border-color);display:flex;flex-direction:column;align-items:center;justify-content:center;">
                                        <i class="fas fa-times" style="color:var(--syntax-red);font-size:0.8rem;"></i>
                                        <span style="font-size:0.55rem;color:var(--text-tertiary);margin-top:4px;">${label}</span>
                                    </div>`;
                                }).join('')}
                            </div>

                            ${user.kyc_remarks ? `<p style="margin: 8px 0 0; font-size: 0.8rem; color: var(--syntax-orange);"><i class="fas fa-comment"></i> ${user.kyc_remarks}</p>` : ''}

                            ${user.kyc_status === 'submitted' ? `
                                <div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; flex-wrap: wrap;">
                                    <button class="btn btn-primary btn-small kyc-approve" data-user-id="${user.id}" style="font-size: 0.8rem;">
                                        <i class="fas fa-check"></i> Approve
                                    </button>
                                    <button class="btn btn-danger btn-small kyc-reject" data-user-id="${user.id}" style="font-size: 0.8rem;">
                                        <i class="fas fa-times"></i> Reject
                                    </button>
                                    <input type="text" class="kyc-remarks-input" data-user-id="${user.id}" placeholder="Remarks (optional for approve, required for reject)" style="flex:1;min-width:180px;padding:6px 10px;border-radius:6px;border:1px solid var(--border-color);background:var(--bg-tertiary);color:var(--text-primary);font-size:0.8rem;">
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        };

        adminKYC.innerHTML = `
            <div style="animation: fadeIn 0.3s ease-in-out;">
                <h2 style="margin-bottom: 24px;"><i class="fas fa-id-card"></i> KYC Verification</h2>

                ${submitted.length > 0 ? `
                    <h4 style="color: var(--syntax-orange); margin-bottom: 12px;"><i class="fas fa-hourglass-half"></i> Pending Review (${submitted.length})</h4>
                    ${submitted.map(renderUserCard).join('')}
                ` : `
                    <div class="card" style="padding: 24px; text-align: center; margin-bottom: 24px;">
                        <p style="color: var(--text-secondary); margin: 0;"><i class="fas fa-check"></i> No pending KYC applications</p>
                    </div>
                `}

                ${verified.length > 0 ? `
                    <h4 style="color: var(--syntax-green); margin: 24px 0 12px;"><i class="fas fa-check-circle"></i> Verified (${verified.length})</h4>
                    ${verified.map(renderUserCard).join('')}
                ` : ''}

                ${rejected.length > 0 ? `
                    <h4 style="color: var(--syntax-red); margin: 24px 0 12px;"><i class="fas fa-times-circle"></i> Rejected (${rejected.length})</h4>
                    ${rejected.map(renderUserCard).join('')}
                ` : ''}
            </div>
        `;

        this.attachKYCListeners();
    }

    attachKYCListeners() {
        document.querySelectorAll('.kyc-approve').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.userId;
                const remarks = document.querySelector(`.kyc-remarks-input[data-user-id="${userId}"]`)?.value || '';
                try {
                    Spinner.show();
                    const res = await api.admin.updateKYCStatus(userId, { status: 'verified', remarks });
                    if (res.success) {
                        Toast.success('KYC approved!');
                        this.loadKYCApplications();
                    }
                } catch (err) { Toast.error(err.message); } finally { Spinner.hide(); }
            });
        });

        document.querySelectorAll('.kyc-reject').forEach(btn => {
            btn.addEventListener('click', async () => {
                const userId = btn.dataset.userId;
                const remarks = document.querySelector(`.kyc-remarks-input[data-user-id="${userId}"]`)?.value || '';
                if (!remarks.trim()) {
                    Toast.warning('Please provide a reason for rejection');
                    return;
                }
                try {
                    Spinner.show();
                    const res = await api.admin.updateKYCStatus(userId, { status: 'rejected', remarks });
                    if (res.success) {
                        Toast.success('KYC rejected');
                        this.loadKYCApplications();
                    }
                } catch (err) { Toast.error(err.message); } finally { Spinner.hide(); }
            });
        });
    }
}

// Global admin module instance
const adminModule = new AdminModule();
