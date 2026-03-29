/**
 * Main Application Module
 * Core application logic, routing, and initialization
 */

class Application {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check authentication
        if (!auth.isLoggedIn()) {
            AuthModule.showLandingPage();
        } else {
            this.setupDashboard();
        }

        // Global event listeners
        this.setupGlobalListeners();
    }

    setupDashboard() {
        this.currentUser = storageUtils.getUserSession();

        const landingPage = document.getElementById('landingPage');
        const authPage = document.getElementById('authPage');
        const mainDashboard = document.getElementById('mainDashboard');

        domUtils.hide(landingPage);
        domUtils.hide(authPage);
        domUtils.show(mainDashboard);

        // Setup sidebar
        this.setupSidebar();

        // Setup header
        this.setupHeader();

        // Load initial data
        vehiclesModule.loadLocations();

        // Default page
        if (this.currentUser.role === 'admin') {
            adminModule.loadDashboard();
            this.showPage('adminDashboard');
        } else {
            bookingModule.loadBookings();
            this.showPage('userDashboard');
        }
    }

    setupSidebar() {
        const navLinks = document.getElementById('navLinks');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');

        userNameDisplay.textContent = this.currentUser.full_name || 'User';
        userRoleDisplay.textContent = this.currentUser.role;

        const isAdmin = this.currentUser.role === 'admin';

        const navItems = isAdmin ? [
            { label: 'Dashboard', icon: 'chart-line', page: 'adminDashboard', onclick: () => { adminModule.loadDashboard(); this.showPage('adminDashboard'); } },
            { label: 'Manage Vehicles', icon: 'car', page: 'adminVehicles', onclick: () => { adminModule.loadVehicles(); this.showPage('adminVehicles'); } },
            { label: 'Manage Bookings', icon: 'clipboard-list', page: 'adminBookings', onclick: () => { adminModule.loadBookings(); this.showPage('adminBookings'); } },
            { label: 'About Us', icon: 'info-circle', page: 'aboutPage', onclick: () => { this.showAboutPage(); } }
        ] : [
            { label: 'My Bookings', icon: 'calendar-check', page: 'userDashboard', onclick: () => { bookingModule.loadBookings(); this.showPage('userDashboard'); } },
            { label: 'Browse Vehicles', icon: 'car', page: 'vehiclesBrowse', onclick: () => { vehiclesModule.loadVehicles(); this.showPage('vehiclesBrowse'); } },
            { label: 'Plans', icon: 'crown', page: 'plansPage', onclick: () => { this.showPlansPage(); } },
            { label: 'Profile', icon: 'user-cog', page: 'profilePage', onclick: () => { this.showProfilePage(); } },
            { label: 'About Us', icon: 'info-circle', page: 'aboutPage', onclick: () => { this.showAboutPage(); } }
        ];

        navLinks.innerHTML = navItems.map(item => `
            <li>
                <a href="#" class="nav-item" data-page="${item.page}">
                    <i class="fas fa-${item.icon}"></i>
                    <span>${item.label}</span>
                </a>
            </li>
        `).join('');

        // Add event listeners
        navLinks.querySelectorAll('a').forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navItems[index].onclick();

                // Update active state
                navLinks.querySelectorAll('a').forEach(l => domUtils.removeClass(l, 'active'));
                domUtils.addClass(link, 'active');
            });
        });

        // Set initial active
        if (navLinks.firstElementChild) {
            domUtils.addClass(navLinks.firstElementChild.querySelector('a'), 'active');
        }
    }

    setupHeader() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            ThemeManager.toggle();
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                auth.logout();
            }
        });
    }

    setupGlobalListeners() {
        // Theme toggle updates icon
        ThemeManager.updateIcon();
    }

    showPage(pageName) {
        document.querySelectorAll('.page-content').forEach(page => domUtils.hide(page));
        const pageToShow = document.getElementById(pageName);
        if (pageToShow) {
            domUtils.show(pageToShow);
        }
    }

    async showVehicleDetails(vehicleId) {
        try {
            Spinner.show();
            const response = await api.vehicles.getById(vehicleId);
            const vehicle = response.data;

            // Get booked dates
            const datesResponse = await api.vehicles.getAvailableDates(vehicleId);
            const bookedDates = datesResponse.bookedDates || datesResponse.data?.bookedDates || [];

            const vehiclesDetails = document.getElementById('vehiclesDetails');
            if (!vehiclesDetails) {
                // If container doesn't exist, create it
                const mainContent = document.querySelector('.content-container');
                const container = document.createElement('section');
                container.id = 'vehiclesDetails';
                container.className = 'page-content';
                mainContent.appendChild(container);
            }

            document.getElementById('vehiclesDetails').innerHTML = Components.vehicleDetails(vehicle, bookedDates);

            // Create calendar and store reference
            let vehicleCalendar = null;
            setTimeout(() => {
                vehicleCalendar = new Calendar('calendar', {
                    vehicleId: vehicleId,
                    bookedDates: bookedDates,
                    onDateSelect: (dates) => {
                        console.log('Dates selected:', dates);
                    }
                });
            }, 100);

            // Handle proceed to booking
            document.getElementById('proceedToBooking')?.addEventListener('click', async () => {
                const selectedDates = vehicleCalendar?.getSelectedDates?.();
                if (selectedDates) {
                    try {
                        Spinner.show();
                        const bookingResponse = await api.bookings.create({
                            vehicle_id: vehicleId,
                            start_date: selectedDates.startDate,
                            end_date: selectedDates.endDate,
                            pickup_location: vehicle.location,
                            dropoff_location: vehicle.location
                        });
                        if (bookingResponse.success) {
                            Toast.success('Booking created! Redirecting to payment...');
                            setTimeout(() => {
                                this.showPaymentPage(bookingResponse.data.bookingId);
                            }, 1000);
                        }
                    } catch (error) {
                        Toast.error(error.message || 'Failed to create booking');
                    } finally {
                        Spinner.hide();
                    }
                } else {
                    Toast.warning('Please select check-in and check-out dates');
                }
            });

            this.showPage('vehiclesDetails');
            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load vehicle details');
            Spinner.hide();
        }
    }

    async showPaymentPage(bookingId) {
        try {
            Spinner.show();
            const response = await api.bookings.getById(bookingId);
            const booking = response.data;

            // Create Razorpay order
            const orderRes = await api.payments.createOrder({ booking_id: bookingId });
            if (!orderRes.success) {
                Toast.error(orderRes.message || 'Failed to create payment order');
                Spinner.hide();
                return;
            }

            const { order_id, amount, currency, key_id } = orderRes.data;

            // Get user info for prefill
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            Spinner.hide();

            // Open Razorpay Checkout
            const options = {
                key: key_id,
                amount: amount,
                currency: currency,
                name: 'DriveIndia',
                description: `Booking #${bookingId} — ${booking.vehicle_name || 'Vehicle Rental'}`,
                order_id: order_id,
                handler: async (response) => {
                    // Payment successful — verify on server
                    try {
                        Spinner.show();
                        const verifyRes = await api.payments.verify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_id: bookingId
                        });

                        if (verifyRes.success) {
                            Toast.success(`Payment successful! ID: ${response.razorpay_payment_id}`);
                            setTimeout(() => {
                                bookingModule.loadBookings();
                                app.showPage('userDashboard');
                            }, 1500);
                        } else {
                            Toast.error(verifyRes.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        Toast.error('Payment verification failed');
                    } finally {
                        Spinner.hide();
                    }
                },
                prefill: {
                    name: user.full_name || '',
                    email: user.email || '',
                    contact: user.phone || ''
                },
                theme: { color: '#4ade80' },
                modal: {
                    ondismiss: () => {
                        Toast.warning('Payment cancelled');
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.on('payment.failed', (response) => {
                Toast.error(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (error) {
            Toast.error('Failed to initiate payment');
            Spinner.hide();
        }
    }

    showAddVehicleForm() {
        const form = `
            <div class="card" style="max-width: 600px; margin: 0 auto;">
                <div class="card-header">
                    <h4 style="margin: 0;">Add New Vehicle</h4>
                </div>
                <div class="card-body">
                    <form id="addVehicleForm">
                        <div class="form-group">
                            <label>Vehicle Image</label>
                            <div id="imageUploadArea" style="border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: 24px; text-align: center; cursor: pointer; transition: var(--transition); position: relative; overflow: hidden;">
                                <div id="imagePreviewContainer" style="display: none; position: relative;">
                                    <img id="imagePreview" style="max-width: 100%; max-height: 200px; border-radius: var(--radius-md); object-fit: cover;">
                                    <button type="button" id="removeImageBtn" style="position: absolute; top: 8px; right: 8px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                                <div id="uploadPlaceholder">
                                    <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--text-tertiary); margin-bottom: 8px; display: block;"></i>
                                    <p style="margin: 0; color: var(--text-secondary);">Click to upload vehicle image</p>
                                    <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-tertiary);">JPEG, PNG or WebP (max 5MB)</p>
                                </div>
                                <input type="file" id="vehicleImage" name="image" accept="image/jpeg,image/png,image/webp" style="display: none;">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="vehicleName">Vehicle Name</label>
                            <input type="text" id="vehicleName" name="name" placeholder="Enter vehicle name" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group" style="margin: 0;">
                                <label for="vehicleType">Type</label>
                                <select id="vehicleType" name="type" required>
                                    <option value="">Select Type</option>
                                    <option value="Car">Car</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Scooter">Scooter</option>
                                </select>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label for="vehicleFuelType">Fuel Type</label>
                                <select id="vehicleFuelType" name="fuel_type" required>
                                    <option value="">Select Fuel Type</option>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Electric">Electric</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group" style="margin: 0;">
                                <label for="vehiclePrice">Price per Day (₹)</label>
                                <input type="number" id="vehiclePrice" name="price_per_day" min="0" placeholder="Enter price" required>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label for="vehicleLocation">Location</label>
                                <select id="vehicleLocation" name="location" required>
                                    <option value="">Select Location</option>
                                    <option value="Mumbai">Mumbai</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Pune">Pune</option>
                                    <option value="Bangalore">Bangalore</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="vehicleRegistration">Registration Number</label>
                            <input type="text" id="vehicleRegistration" name="registration_number" placeholder="Vehicle registration number" required>
                        </div>

                        <div class="form-group">
                            <label for="vehicleCapacity">Seating Capacity</label>
                            <input type="number" id="vehicleCapacity" name="capacity" min="1" value="5" required>
                        </div>

                        <div class="form-group">
                            <label for="vehicleDescription">Description</label>
                            <textarea id="vehicleDescription" name="description" placeholder="Vehicle description"></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary w-full">
                            <i class="fas fa-plus"></i> Add Vehicle
                        </button>
                    </form>
                </div>
            </div>
        `;

        const adminVehicles = document.getElementById('adminVehicles');
        if (adminVehicles) {
            adminVehicles.innerHTML = form;
            this.setupImageUpload('imageUploadArea', 'vehicleImage', 'imagePreview', 'imagePreviewContainer', 'uploadPlaceholder', 'removeImageBtn');
            document.getElementById('addVehicleForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addVehicle();
            });
        }
    }

    async addVehicle() {
        try {
            Spinner.show();
            const form = document.getElementById('addVehicleForm');
            const formData = new FormData(form);

            const response = await api.admin.addVehicle(formData);

            if (response.success) {
                Toast.success('Vehicle added successfully');
                adminModule.loadVehicles();
            }
        } catch (error) {
            Toast.error('Failed to add vehicle');
        } finally {
            Spinner.hide();
        }
    }

    setupImageUpload(areaId, inputId, previewId, previewContainerId, placeholderId, removeBtnId) {
        const area = document.getElementById(areaId);
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        const previewContainer = document.getElementById(previewContainerId);
        const placeholder = document.getElementById(placeholderId);
        const removeBtn = document.getElementById(removeBtnId);

        if (!area || !input) return;

        // Click to open file picker
        area.addEventListener('click', (e) => {
            if (e.target.closest('#' + removeBtnId)) return;
            input.click();
        });

        // Drag & drop
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--primary)';
            area.style.background = 'rgba(99, 102, 241, 0.05)';
        });
        area.addEventListener('dragleave', () => {
            area.style.borderColor = 'var(--border-color)';
            area.style.background = '';
        });
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--border-color)';
            area.style.background = '';
            if (e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                this.showImagePreview(input.files[0], preview, previewContainer, placeholder);
            }
        });

        // File selected
        input.addEventListener('change', () => {
            if (input.files.length) {
                this.showImagePreview(input.files[0], preview, previewContainer, placeholder);
            }
        });

        // Remove image
        removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            input.value = '';
            previewContainer.style.display = 'none';
            placeholder.style.display = '';
        });
    }

    showImagePreview(file, previewImg, previewContainer, placeholder) {
        if (file.size > 5 * 1024 * 1024) {
            Toast.error('Image must be less than 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    async showEditVehicleForm(vehicleId) {
        try {
            Spinner.show();
            const response = await api.vehicles.getById(vehicleId);
            const vehicle = response.data;

            const currentImageHtml = vehicle.image_url
                ? `<img src="${this.getImageUrl(vehicle.image_url)}" style="max-width: 100%; max-height: 200px; border-radius: var(--radius-md); object-fit: cover;">`
                : '';

            const form = `
                <div class="card" style="max-width: 600px; margin: 0 auto;">
                    <div class="card-header">
                        <h4 style="margin: 0;">Edit Vehicle</h4>
                    </div>
                    <div class="card-body">
                        <form id="editVehicleForm">
                            <div class="form-group">
                                <label>Vehicle Image</label>
                                <div id="editImageUploadArea" style="border: 2px dashed var(--border-color); border-radius: var(--radius-lg); padding: 24px; text-align: center; cursor: pointer; transition: var(--transition); position: relative; overflow: hidden;">
                                    <div id="editImagePreviewContainer" style="${vehicle.image_url ? 'display: block;' : 'display: none;'} position: relative;">
                                        <img id="editImagePreview" src="${vehicle.image_url ? this.getImageUrl(vehicle.image_url) : ''}" style="max-width: 100%; max-height: 200px; border-radius: var(--radius-md); object-fit: cover;">
                                        <button type="button" id="editRemoveImageBtn" style="position: absolute; top: 8px; right: 8px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <div id="editUploadPlaceholder" style="${vehicle.image_url ? 'display: none;' : ''}">
                                        <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--text-tertiary); margin-bottom: 8px; display: block;"></i>
                                        <p style="margin: 0; color: var(--text-secondary);">Click to upload new image</p>
                                        <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-tertiary);">JPEG, PNG or WebP (max 5MB)</p>
                                    </div>
                                    <input type="file" id="editVehicleImage" name="image" accept="image/jpeg,image/png,image/webp" style="display: none;">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="editVehicleName">Vehicle Name</label>
                                <input type="text" id="editVehicleName" name="name" value="${vehicle.name}" required>
                            </div>

                            <div class="form-row">
                                <div class="form-group" style="margin: 0;">
                                    <label for="editVehicleType">Type</label>
                                    <select id="editVehicleType" name="type" required>
                                        <option value="Car" ${vehicle.type === 'Car' ? 'selected' : ''}>Car</option>
                                        <option value="Bike" ${vehicle.type === 'Bike' ? 'selected' : ''}>Bike</option>
                                        <option value="Scooter" ${vehicle.type === 'Scooter' ? 'selected' : ''}>Scooter</option>
                                    </select>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label for="editVehicleFuelType">Fuel Type</label>
                                    <select id="editVehicleFuelType" name="fuel_type" required>
                                        <option value="Petrol" ${vehicle.fuel_type === 'Petrol' ? 'selected' : ''}>Petrol</option>
                                        <option value="Diesel" ${vehicle.fuel_type === 'Diesel' ? 'selected' : ''}>Diesel</option>
                                        <option value="Electric" ${vehicle.fuel_type === 'Electric' ? 'selected' : ''}>Electric</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group" style="margin: 0;">
                                    <label for="editVehiclePrice">Price per Day (₹)</label>
                                    <input type="number" id="editVehiclePrice" name="price_per_day" min="0" value="${vehicle.price_per_day}" required>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label for="editVehicleLocation">Location</label>
                                    <select id="editVehicleLocation" name="location" required>
                                        <option value="Mumbai" ${vehicle.location === 'Mumbai' ? 'selected' : ''}>Mumbai</option>
                                        <option value="Delhi" ${vehicle.location === 'Delhi' ? 'selected' : ''}>Delhi</option>
                                        <option value="Pune" ${vehicle.location === 'Pune' ? 'selected' : ''}>Pune</option>
                                        <option value="Bangalore" ${vehicle.location === 'Bangalore' ? 'selected' : ''}>Bangalore</option>
                                        <option value="Hyderabad" ${vehicle.location === 'Hyderabad' ? 'selected' : ''}>Hyderabad</option>
                                        <option value="Chennai" ${vehicle.location === 'Chennai' ? 'selected' : ''}>Chennai</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group" style="margin: 0;">
                                    <label for="editVehicleCapacity">Seating Capacity</label>
                                    <input type="number" id="editVehicleCapacity" name="capacity" min="1" value="${vehicle.capacity}" required>
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label for="editVehicleAvailability">Availability</label>
                                    <select id="editVehicleAvailability" name="availability_status" required>
                                        <option value="1" ${vehicle.availability_status ? 'selected' : ''}>Available</option>
                                        <option value="0" ${!vehicle.availability_status ? 'selected' : ''}>Unavailable</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="editVehicleDescription">Description</label>
                                <textarea id="editVehicleDescription" name="description">${vehicle.description || ''}</textarea>
                            </div>

                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn btn-primary" style="flex: 1;">
                                    <i class="fas fa-save"></i> Save Changes
                                </button>
                                <button type="button" class="btn btn-outline" id="cancelEditBtn">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            const adminVehicles = document.getElementById('adminVehicles');
            if (adminVehicles) {
                adminVehicles.innerHTML = form;
                this.setupImageUpload('editImageUploadArea', 'editVehicleImage', 'editImagePreview', 'editImagePreviewContainer', 'editUploadPlaceholder', 'editRemoveImageBtn');
                document.getElementById('editVehicleForm')?.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.editVehicle(vehicleId);
                });
                document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
                    adminModule.loadVehicles();
                });
            }

            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load vehicle details');
            Spinner.hide();
        }
    }

    async editVehicle(vehicleId) {
        try {
            Spinner.show();
            const form = document.getElementById('editVehicleForm');
            const formData = new FormData(form);

            const response = await api.admin.editVehicle(vehicleId, formData);

            if (response.success) {
                Toast.success('Vehicle updated successfully');
                adminModule.loadVehicles();
            }
        } catch (error) {
            Toast.error('Failed to update vehicle');
        } finally {
            Spinner.hide();
        }
    }

    getImageUrl(url) {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;

        const backendOrigin =
            window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:5000'
                : window.location.origin;

        if (url.startsWith('/')) {
            return `${backendOrigin}${url}`;
        }

        return `${backendOrigin}/${url}`;
    }

    // =============================================
    // PROFILE PAGE
    // =============================================
    async showProfilePage() {
        const container = document.getElementById('profilePage');
        if (!container) return;

        container.innerHTML = `<div style="text-align:center; padding: 60px;"><div class="spinner"></div><p style="color: var(--text-secondary); margin-top: 12px;">Loading profile...</p></div>`;
        this.showPage('profilePage');

        try {
            const response = await api.auth.getProfile();
            const user = response.data;
            const photoUrl = user.profile_photo ? this.getImageUrl(user.profile_photo) : null;

            container.innerHTML = `
                <div style="max-width: 800px; margin: 0 auto;">
                    <h2 style="font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; margin-bottom: 24px; color: var(--text-primary);"><span style="color: var(--syntax-green);">></span> profile</h2>

                    <!-- Profile Header Card -->
                    <div class="card" style="padding: 28px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap;">
                            <div style="position: relative;">
                                <div id="profilePhotoPreview" style="width: 90px; height: 90px; border-radius: 50%; background: var(--bg-tertiary); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer;" title="Click to upload photo">
                                    ${photoUrl 
                                        ? `<img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Profile">` 
                                        : `<i class="fas fa-user" style="font-size: 2.2rem; color: var(--syntax-purple);"></i>`}
                                </div>
                                <label for="profilePhotoInput" style="position: absolute; bottom: 0; right: 0; width: 28px; height: 28px; background: var(--syntax-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid var(--bg-secondary);">
                                    <i class="fas fa-camera" style="font-size: 0.7rem; color: #fff;"></i>
                                </label>
                                <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;">
                            </div>
                            <div style="flex: 1;">
                                <h3 style="margin: 0 0 4px; font-size: 1.3rem;">${user.full_name}</h3>
                                <p style="margin: 0 0 4px; color: var(--text-secondary); font-size: 0.88rem;">${user.email}</p>
                                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px;">
                                    <span class="badge badge-${user.role === 'admin' ? 'error' : 'primary'}" style="font-size: 0.72rem;">${user.role.toUpperCase()}</span>
                                    <span class="badge badge-${user.verified ? 'success' : 'warning'}" style="font-size: 0.72rem;">
                                        <i class="fas fa-${user.verified ? 'check-circle' : 'exclamation-circle'}"></i> 
                                        ${user.verified ? 'Verified' : 'Unverified'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Profile Form -->
                    <div class="card" style="padding: 28px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: var(--text-secondary);"><i class="fas fa-edit" style="color: var(--syntax-blue); margin-right: 8px;"></i>Edit Profile</h4>
                        <form id="editProfileForm">
                            <div class="form-row">
                                <div class="form-group" style="margin:0;"><label>FULL_NAME</label><input type="text" id="profName" value="${user.full_name}" required></div>
                                <div class="form-group" style="margin:0;"><label>PHONE</label><input type="tel" id="profPhone" value="${user.phone}" maxlength="10" required></div>
                            </div>
                            <div class="form-row">
                                <div class="form-group" style="margin:0;"><label>CITY</label>
                                    <select id="profCity">
                                        <option value="">Select City</option>
                                        ${['Mumbai','Delhi','Bangalore','Pune','Hyderabad','Chennai'].map(c => `<option value="${c}" ${user.city === c ? 'selected' : ''}>${c}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group" style="margin:0;"><label>DRIVING_LICENSE</label><input type="text" id="profLicense" value="${user.driving_license || ''}"></div>
                            </div>
                            <div class="form-group"><label>ADDRESS</label><textarea id="profAddress" rows="2" style="resize: vertical;">${user.address || ''}</textarea></div>
                            <button type="submit" class="btn btn-primary" style="font-family: 'JetBrains Mono', monospace;"><i class="fas fa-save"></i> Save Changes</button>
                        </form>
                    </div>

                    <!-- Aadhaar Verification -->
                    <div class="card" style="padding: 28px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: var(--text-secondary);"><i class="fas fa-id-card" style="color: var(--syntax-cyan); margin-right: 8px;"></i>Aadhaar Verification</h4>
                        ${user.verified 
                            ? `<div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); border-radius: 8px;">
                                <i class="fas fa-check-circle" style="font-size: 1.5rem; color: var(--syntax-green);"></i>
                                <div>
                                    <p style="margin: 0; font-weight: 600; color: var(--syntax-green);">Aadhaar Verified</p>
                                    <p style="margin: 4px 0 0; font-size: 0.82rem; color: var(--text-secondary);">XXXX-XXXX-${(user.aadhaar_number || '').slice(-4)}</p>
                                </div>
                              </div>`
                            : `<div style="display: flex; gap: 12px; align-items: flex-end;">
                                <div class="form-group" style="margin: 0; flex: 1;">
                                    <label>AADHAAR_NUMBER</label>
                                    <input type="text" id="aadhaarInput" placeholder="Enter 12-digit Aadhaar" maxlength="12" value="${user.aadhaar_number || ''}">
                                </div>
                                <button id="verifyAadhaarBtn" class="btn btn-primary" style="font-family: 'JetBrains Mono', monospace; white-space: nowrap; height: 42px;">
                                    <i class="fas fa-fingerprint"></i> Verify
                                </button>
                              </div>
                              <p style="margin: 8px 0 0; font-size: 0.78rem; color: var(--text-tertiary);">Verification connects to UIDAI. Your data is encrypted and secure.</p>`
                        }
                    </div>

                    <!-- Change Password -->
                    <div class="card" style="padding: 28px; margin-bottom: 20px;">
                        <h4 style="margin-top: 0; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: var(--text-secondary);"><i class="fas fa-lock" style="color: var(--syntax-orange); margin-right: 8px;"></i>Change Password</h4>
                        <form id="changePasswordForm">
                            <div class="form-row">
                                <div class="form-group" style="margin:0;"><label>CURRENT_PASSWORD</label><input type="password" id="currentPassword" placeholder="Current password" required></div>
                                <div class="form-group" style="margin:0;"><label>NEW_PASSWORD</label><input type="password" id="newPassword" placeholder="Min 6 characters" required></div>
                            </div>
                            <button type="submit" class="btn btn-outline" style="font-family: 'JetBrains Mono', monospace; margin-top: 8px;"><i class="fas fa-key"></i> Update Password</button>
                        </form>
                    </div>

                    <!-- Pickup Locations Map -->
                    <div class="card" style="padding: 28px;">
                        <h4 style="margin-top: 0; margin-bottom: 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: var(--text-secondary);"><i class="fas fa-map-marker-alt" style="color: var(--syntax-red); margin-right: 8px;"></i>Pickup Locations</h4>
                        <div id="profileMap" style="height: 320px; border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden;"></div>
                    </div>
                </div>
            `;

            this.attachProfileListeners(user);
            setTimeout(() => this.initMap('profileMap'), 200);
        } catch (error) {
            container.innerHTML = `<div class="card" style="padding: 40px; text-align: center;"><p style="color: var(--syntax-red);">Failed to load profile: ${error.message}</p></div>`;
        }
    }

    attachProfileListeners(user) {
        // Upload photo
        document.getElementById('profilePhotoInput')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('photo', file);
            try {
                Spinner.show();
                const res = await api.auth.uploadPhoto(formData);
                if (res.success) {
                    Toast.success('Photo uploaded!');
                    const preview = document.getElementById('profilePhotoPreview');
                    preview.innerHTML = `<img src="${this.getImageUrl(res.data.photo_url)}" style="width:100%;height:100%;object-fit:cover;" alt="Profile">`;
                }
            } catch (err) { Toast.error(err.message); } finally { Spinner.hide(); }
        });

        // Edit profile form
        document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                Spinner.show();
                await api.auth.updateProfile({
                    full_name: document.getElementById('profName').value,
                    phone: document.getElementById('profPhone').value,
                    city: document.getElementById('profCity').value,
                    driving_license: document.getElementById('profLicense').value,
                    address: document.getElementById('profAddress').value
                });
                Toast.success('Profile updated!');
                // Update navbar name
                document.getElementById('userNameDisplay').textContent = document.getElementById('profName').value;
                // Update session storage
                const session = storageUtils.getUserSession();
                session.full_name = document.getElementById('profName').value;
                storageUtils.setUserSession(session);
            } catch (err) { Toast.error(err.message); } finally { Spinner.hide(); }
        });

        // Aadhaar verify
        document.getElementById('verifyAadhaarBtn')?.addEventListener('click', async () => {
            const aadhaar = document.getElementById('aadhaarInput').value.trim();
            if (!/^\d{12}$/.test(aadhaar)) { Toast.error('Enter a valid 12-digit Aadhaar number'); return; }
            try {
                Spinner.show();
                const btn = document.getElementById('verifyAadhaarBtn');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
                btn.disabled = true;
                const res = await api.auth.verifyAadhaar(aadhaar);
                if (res.success) {
                    Toast.success('Aadhaar verified successfully!');
                    this.showProfilePage(); // Refresh to show verified state
                } else {
                    Toast.error(res.message || 'Verification failed');
                    btn.innerHTML = '<i class="fas fa-fingerprint"></i> Verify';
                    btn.disabled = false;
                }
            } catch (err) { Toast.error(err.message); } finally { Spinner.hide(); }
        });

        // Change password
        document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const current_password = document.getElementById('currentPassword').value;
            const new_password = document.getElementById('newPassword').value;
            if (new_password.length < 6) { Toast.error('New password must be at least 6 characters'); return; }
            try {
                Spinner.show();
                await api.auth.changePassword({ current_password, new_password });
                Toast.success('Password changed!');
                document.getElementById('changePasswordForm').reset();
            } catch (err) { Toast.error(err.message); } finally { Spinner.hide(); }
        });
    }

    // =============================================
    // MAP INITIALIZATION
    // =============================================
    initMap(containerId) {
        const mapEl = document.getElementById(containerId);
        if (!mapEl || typeof L === 'undefined') return;

        // Indian city coordinates for pickup locations
        const locations = [
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777, vehicles: 'Maruti Swift, TVS Jupiter, Mahindra XUV500' },
            { name: 'Delhi', lat: 28.6139, lng: 77.2090, vehicles: 'Hyundai Creta, Bajaj Avenger' },
            { name: 'Bangalore', lat: 12.9716, lng: 77.5946, vehicles: 'Tata Nexon EV' },
            { name: 'Pune', lat: 18.5204, lng: 73.8567, vehicles: 'Hero CB Shine, Honda Activa' },
            { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, vehicles: 'Coming Soon' },
            { name: 'Chennai', lat: 13.0827, lng: 80.2707, vehicles: 'Coming Soon' }
        ];

        const map = L.map(containerId, {
            scrollWheelZoom: false
        }).setView([20.5937, 78.9629], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        const greenIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #4ade80; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        locations.forEach(loc => {
            L.marker([loc.lat, loc.lng], { icon: greenIcon })
                .addTo(map)
                .bindPopup(`<div style="font-family: 'Inter', sans-serif; font-size: 13px;">
                    <strong style="color: #1a1a2e;">${loc.name}</strong><br>
                    <span style="color: #555; font-size: 11px;">${loc.vehicles}</span>
                </div>`);
        });

        // Fix map rendering issue when container is initially hidden
        setTimeout(() => map.invalidateSize(), 300);
    }

    // =============================================
    // PLANS / SUBSCRIPTION PAGE
    // =============================================
    async showPlansPage() {
        const container = document.getElementById('plansPage');
        if (!container) return;

        container.innerHTML = `<div style="text-align:center; padding: 60px;"><div class="spinner"></div><p style="color: var(--text-secondary); margin-top: 12px;">Loading plans...</p></div>`;
        this.showPage('plansPage');

        try {
            const [plansRes, subRes] = await Promise.all([
                api.subscriptions.getPlans(),
                api.subscriptions.getMy()
            ]);

            const plans = plansRes.data || [];
            const activeSub = subRes.data;

            container.innerHTML = `
                <div style="max-width: 1000px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h2 style="font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; margin-bottom: 8px;"><span style="color: var(--syntax-green);">></span> subscription --plans</h2>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Choose a plan that fits your travel needs</p>
                    </div>

                    ${activeSub && activeSub.status === 'active' ? `
                        <div class="card" style="padding: 20px; margin-bottom: 28px; border-left: 3px solid var(--syntax-green);">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                                <div>
                                    <p style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--syntax-green);"><i class="fas fa-crown"></i> Active Plan: ${activeSub.plan_name}</p>
                                    <p style="margin: 4px 0 0; font-size: 0.82rem; color: var(--text-secondary);">Expires: ${formatUtils.formatDate(activeSub.end_date)} &bull; TXN: ${activeSub.transaction_id}</p>
                                </div>
                                <button id="cancelSubBtn" class="btn btn-outline" style="font-size: 0.8rem; padding: 6px 16px; border-color: var(--syntax-red); color: var(--syntax-red);"><i class="fas fa-times"></i> Cancel</button>
                            </div>
                        </div>
                    ` : ''}

                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        ${plans.map((plan, i) => {
                            const colors = ['var(--syntax-blue)', 'var(--syntax-purple)', 'var(--syntax-green)'];
                            const icons = ['fa-calendar-day', 'fa-calendar-week', 'fa-calendar-alt'];
                            const popular = i === 2;
                            const features = (plan.features || '').split(',');
                            const isActive = activeSub && activeSub.status === 'active' && activeSub.plan_id === plan.id;
                            return `
                                <div class="card" style="padding: 0; overflow: hidden; position: relative; ${popular ? 'border-color: var(--syntax-green); box-shadow: 0 0 20px rgba(74,222,128,0.1);' : ''}">
                                    ${popular ? '<div style="background: var(--syntax-green); color: #0d1117; text-align: center; padding: 6px; font-family: \'JetBrains Mono\', monospace; font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Most Popular</div>' : ''}
                                    <div style="padding: 28px;">
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <div style="width: 48px; height: 48px; background: ${colors[i]}15; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
                                                <i class="fas ${icons[i]}" style="font-size: 1.3rem; color: ${colors[i]};"></i>
                                            </div>
                                            <h3 style="margin: 0 0 4px; font-size: 1.1rem;">${plan.name}</h3>
                                            <p style="margin: 0; color: var(--text-tertiary); font-size: 0.8rem; text-transform: uppercase; font-family: 'JetBrains Mono', monospace;">${plan.duration_type}</p>
                                        </div>
                                        <div style="text-align: center; margin-bottom: 20px;">
                                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; color: ${colors[i]};">
                                                ${plan.price == 0 ? 'Free' : '₹' + plan.price}
                                            </span>
                                            ${plan.price > 0 ? `<span style="color: var(--text-tertiary); font-size: 0.82rem;">/${plan.duration_type === 'weekly' ? 'week' : 'month'}</span>` : ''}
                                        </div>
                                        <div style="margin-bottom: 24px;">
                                            ${features.map(f => `
                                                <div style="display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.85rem; color: var(--text-secondary);">
                                                    <i class="fas fa-check" style="color: var(--syntax-green); font-size: 0.75rem;"></i> ${f.trim()}
                                                </div>
                                            `).join('')}
                                            ${!plan.roadside_assistance ? '<div style="display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.85rem; color: var(--text-tertiary);"><i class="fas fa-minus" style="font-size: 0.75rem;"></i> Roadside Assistance</div>' : ''}
                                            ${!plan.unlimited_km ? '<div style="display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.85rem; color: var(--text-tertiary);"><i class="fas fa-minus" style="font-size: 0.75rem;"></i> Unlimited KM</div>' : ''}
                                            ${!plan.priority_support ? '<div style="display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.85rem; color: var(--text-tertiary);"><i class="fas fa-minus" style="font-size: 0.75rem;"></i> Priority Support</div>' : ''}
                                        </div>
                                        <button class="btn ${isActive ? 'btn-outline' : (popular ? 'btn-primary' : 'btn-outline')} w-full subscribe-btn" 
                                            data-plan-id="${plan.id}" 
                                            style="justify-content: center; font-family: 'JetBrains Mono', monospace; ${isActive ? 'pointer-events: none; opacity: 0.6;' : ''}"
                                            ${isActive ? 'disabled' : ''}>
                                            ${isActive ? '<i class="fas fa-check-circle"></i> Current Plan' : (plan.price == 0 ? 'Current Plan' : '<i class="fas fa-bolt"></i> Subscribe')}
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <!-- Pickup Locations Map -->
                    <div class="card" style="margin-top: 28px; padding: 24px;">
                        <h3 style="margin-top: 0; margin-bottom: 16px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: var(--text-secondary);"><span style="color: var(--syntax-green);">></span> pickup-locations</h3>
                        <div id="plansMap" style="height: 350px; border-radius: 8px; border: 1px solid var(--border-color); overflow: hidden;"></div>
                    </div>
                </div>
            `;

            this.attachPlansListeners(activeSub);
            setTimeout(() => this.initMap('plansMap'), 200);
        } catch (error) {
            container.innerHTML = `<div class="card" style="padding: 40px; text-align: center;"><p style="color: var(--syntax-red);">Failed to load plans: ${error.message}</p></div>`;
        }
    }

    attachPlansListeners(activeSub) {
        // Subscribe buttons
        document.querySelectorAll('.subscribe-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const planId = parseInt(btn.dataset.planId);
                if (!planId || planId === 0) return;
                if (activeSub && activeSub.status === 'active') {
                    Toast.warning('Cancel your current plan first');
                    return;
                }
                try {
                    Spinner.show();
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    btn.disabled = true;

                    // Create Razorpay order for subscription
                    const orderRes = await api.subscriptions.createOrder({ plan_id: planId });

                    // Free plan — already activated by backend
                    if (orderRes.data && !orderRes.data.order_id) {
                        Toast.success(orderRes.message);
                        Spinner.hide();
                        this.showPlansPage();
                        return;
                    }

                    const { order_id, amount, currency, key_id, plan_name } = orderRes.data;
                    const user = JSON.parse(localStorage.getItem('user') || '{}');

                    Spinner.hide();

                    // Open Razorpay Checkout
                    const options = {
                        key: key_id,
                        amount: amount,
                        currency: currency,
                        name: 'DriveIndia',
                        description: `Subscription — ${plan_name}`,
                        order_id: order_id,
                        handler: async (response) => {
                            try {
                                Spinner.show();
                                const verifyRes = await api.subscriptions.verify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    plan_id: planId
                                });
                                if (verifyRes.success) {
                                    Toast.success(verifyRes.message);
                                    this.showPlansPage();
                                } else {
                                    Toast.error(verifyRes.message || 'Subscription verification failed');
                                }
                            } catch (err) {
                                Toast.error(err.message || 'Subscription verification failed');
                            } finally { Spinner.hide(); }
                        },
                        prefill: {
                            name: user.full_name || '',
                            email: user.email || '',
                            contact: user.phone || ''
                        },
                        theme: { color: '#4ade80' },
                        modal: {
                            ondismiss: () => {
                                btn.innerHTML = '<i class="fas fa-bolt"></i> Subscribe';
                                btn.disabled = false;
                                Toast.warning('Payment cancelled');
                            }
                        }
                    };

                    const rzp = new Razorpay(options);
                    rzp.on('payment.failed', (response) => {
                        Toast.error(`Payment failed: ${response.error.description}`);
                        btn.innerHTML = '<i class="fas fa-bolt"></i> Subscribe';
                        btn.disabled = false;
                    });
                    rzp.open();
                } catch (err) {
                    Toast.error(err.message);
                    btn.innerHTML = '<i class="fas fa-bolt"></i> Subscribe';
                    btn.disabled = false;
                    Spinner.hide();
                }
            });
        });

        // Cancel subscription
        document.getElementById('cancelSubBtn')?.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to cancel your subscription?')) return;
            try {
                Spinner.show();
                await api.subscriptions.cancel();
                Toast.success('Subscription cancelled');
                this.showPlansPage();
            } catch (err) { Toast.error(err.message); } finally { Spinner.hide(); }
        });
    }

    showAboutPage() {
        const container = document.getElementById('aboutPage');
        if (!container) return;

        container.innerHTML = `
            <!-- Hero Section — Terminal Output Style -->
            <div class="about-hero">
                <div class="about-hero-content">
                    <i class="fas fa-car about-hero-icon"></i>
                    <h2>DriveIndia <span style="color: var(--syntax-green); font-family: 'JetBrains Mono', monospace; font-size: 0.6em; font-weight: 400;">v2.0</span></h2>
                    <p>India's developer-grade vehicle rental platform — fast, transparent, reliable</p>
                </div>
            </div>

            <!-- Mission — Code Comment Style -->
            <div class="card" style="margin-top: 24px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span class="about-badge"><i class="fas fa-bullseye"></i> mission.config</span>
                </div>
                <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.88rem; line-height: 1.9;">
                    <div style="color: var(--text-tertiary);">/**</div>
                    <div style="color: var(--text-tertiary);"> * <span style="color: var(--syntax-purple);">@mission</span> Revolutionize vehicle rentals across India</div>
                    <div style="color: var(--text-tertiary);"> * <span style="color: var(--syntax-purple);">@approach</span> Seamless, affordable, and reliable platform</div>
                    <div style="color: var(--text-tertiary);"> * <span style="color: var(--syntax-purple);">@goal</span> Empower every Indian to explore the roads with confidence</div>
                    <div style="color: var(--text-tertiary);"> * <span style="color: var(--syntax-purple);">@status</span> <span style="color: var(--syntax-green);">Active</span></div>
                    <div style="color: var(--text-tertiary);"> */</div>
                </div>
            </div>

            <!-- Features Grid — What We Aim For -->
            <div style="margin-top: 24px;">
                <h3 style="text-align: center; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: var(--text-secondary);"><span style="color: var(--syntax-green);">></span> Features</h3>
                <div class="grid grid-3">
                    <div class="card about-aim-card">
                        <div class="about-aim-icon" style="background: rgba(96, 165, 250, 0.15); color: var(--syntax-blue);">
                            <i class="fas fa-hand-holding-usd"></i>
                        </div>
                        <h4>Affordable Rentals</h4>
                        <p>Transparent pricing with zero hidden charges. Quality transportation at fair rates across all Indian cities.</p>
                    </div>
                    <div class="card about-aim-card">
                        <div class="about-aim-icon" style="background: rgba(251, 191, 36, 0.15); color: var(--syntax-yellow);">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                        <h4>Safety First</h4>
                        <p>Every vehicle is inspected and maintained. Verified documents and well-serviced vehicles guaranteed.</p>
                    </div>
                    <div class="card about-aim-card">
                        <div class="about-aim-icon" style="background: rgba(74, 222, 128, 0.15); color: var(--syntax-green);">
                            <i class="fas fa-map-marked-alt"></i>
                        </div>
                        <h4>Pan-India Coverage</h4>
                        <p>Mumbai, Delhi, Bangalore, Pune, Hyderabad, Chennai — and rapidly expanding nationwide.</p>
                    </div>
                    <div class="card about-aim-card">
                        <div class="about-aim-icon" style="background: rgba(248, 113, 113, 0.15); color: var(--syntax-red);">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <h4>Instant Booking</h4>
                        <p>Book your ride in under 2 minutes. Zero paperwork, zero friction — just get on the road.</p>
                    </div>
                    <div class="card about-aim-card">
                        <div class="about-aim-icon" style="background: rgba(192, 132, 252, 0.15); color: var(--syntax-purple);">
                            <i class="fas fa-headset"></i>
                        </div>
                        <h4>24/7 Support</h4>
                        <p>Round-the-clock assistance for any queries or emergencies. Always just a call away.</p>
                    </div>
                    <div class="card about-aim-card">
                        <div class="about-aim-icon" style="background: rgba(34, 211, 238, 0.15); color: var(--syntax-cyan);">
                            <i class="fas fa-leaf"></i>
                        </div>
                        <h4>Eco-Friendly</h4>
                        <p>Electric vehicles alongside petrol and diesel. Supporting India's green mobility vision.</p>
                    </div>
                </div>
            </div>

            <!-- Feature Comparison Table -->
            <div class="card" style="margin-top: 24px; padding: 0; overflow: hidden;">
                <div style="padding: 20px 24px; border-bottom: 1px solid var(--border-color);">
                    <h3 style="margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: var(--text-secondary);"><span style="color: var(--syntax-green);">></span> compare --plans</h3>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
                        <thead>
                            <tr style="background: var(--bg-tertiary);">
                                <th style="padding: 12px 20px; text-align: left; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;">Feature</th>
                                <th style="padding: 12px 20px; text-align: center; color: var(--syntax-blue); font-family: 'JetBrains Mono', monospace; font-weight: 600;">Daily</th>
                                <th style="padding: 12px 20px; text-align: center; color: var(--syntax-purple); font-family: 'JetBrains Mono', monospace; font-weight: 600;">Weekly</th>
                                <th style="padding: 12px 20px; text-align: center; color: var(--syntax-green); font-family: 'JetBrains Mono', monospace; font-weight: 600;">Monthly</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px 20px; color: var(--text-primary);">Cars, Bikes & Scooters</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px 20px; color: var(--text-primary);">Free Cancellation</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px 20px; color: var(--text-primary);">Roadside Assistance</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--text-tertiary);">&mdash;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px 20px; color: var(--text-primary);">Unlimited Kilometers</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--text-tertiary);">&mdash;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--text-tertiary);">&mdash;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                            </tr>
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px 20px; color: var(--text-primary);">Discounted Rates</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--text-tertiary);">&mdash;</td>
                                <td style="padding: 12px 20px; text-align: center; font-family: 'JetBrains Mono', monospace; color: var(--syntax-yellow);">10% off</td>
                                <td style="padding: 12px 20px; text-align: center; font-family: 'JetBrains Mono', monospace; color: var(--syntax-green);">25% off</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 20px; color: var(--text-primary);">Priority Support</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--text-tertiary);">&mdash;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--text-tertiary);">&mdash;</td>
                                <td style="padding: 12px 20px; text-align: center; color: var(--syntax-green);">&#10003;</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Stats Section — Metrics Dashboard -->
            <div class="card" style="margin-top: 24px; padding: 28px;">
                <h3 style="text-align: center; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: var(--text-secondary);"><span style="color: var(--syntax-green);">></span> metrics --live</h3>
                <div class="grid grid-4" style="text-align: center;">
                    <div class="about-stat">
                        <div class="about-stat-number">6+</div>
                        <div class="about-stat-label">cities</div>
                    </div>
                    <div class="about-stat">
                        <div class="about-stat-number" style="color: var(--syntax-blue);">500+</div>
                        <div class="about-stat-label">vehicles</div>
                    </div>
                    <div class="about-stat">
                        <div class="about-stat-number" style="color: var(--syntax-purple);">10K+</div>
                        <div class="about-stat-label">riders</div>
                    </div>
                    <div class="about-stat">
                        <div class="about-stat-number" style="color: var(--syntax-yellow);">4.8</div>
                        <div class="about-stat-label">rating</div>
                    </div>
                </div>
            </div>

            <!-- Integration Logos — Partners Section -->
            <div class="card" style="margin-top: 24px;">
                <h3 style="text-align: center; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: var(--text-secondary);"><span style="color: var(--syntax-green);">></span> integrations</h3>
                <p style="text-align: center; font-size: 0.85rem; color: var(--text-tertiary); margin-bottom: 24px;">Trusted partners & payment integrations</p>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 16px;">
                    <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px 24px; display: flex; align-items: center; gap: 10px; transition: var(--transition); cursor: default;" class="integration-logo">
                        <i class="fas fa-university" style="font-size: 1.3rem; color: var(--syntax-blue);"></i>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--text-secondary);">UPI</span>
                    </div>
                    <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px 24px; display: flex; align-items: center; gap: 10px; transition: var(--transition);" class="integration-logo">
                        <i class="fas fa-credit-card" style="font-size: 1.3rem; color: var(--syntax-purple);"></i>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--text-secondary);">Razorpay</span>
                    </div>
                    <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px 24px; display: flex; align-items: center; gap: 10px; transition: var(--transition);" class="integration-logo">
                        <i class="fas fa-map" style="font-size: 1.3rem; color: var(--syntax-green);"></i>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--text-secondary);">Google Maps</span>
                    </div>
                    <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px 24px; display: flex; align-items: center; gap: 10px; transition: var(--transition);" class="integration-logo">
                        <i class="fas fa-sms" style="font-size: 1.3rem; color: var(--syntax-orange);"></i>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--text-secondary);">SMS Gateway</span>
                    </div>
                    <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px 24px; display: flex; align-items: center; gap: 10px; transition: var(--transition);" class="integration-logo">
                        <i class="fas fa-id-card" style="font-size: 1.3rem; color: var(--syntax-cyan);"></i>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--text-secondary);">Aadhaar Verify</span>
                    </div>
                    <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px 24px; display: flex; align-items: center; gap: 10px; transition: var(--transition);" class="integration-logo">
                        <i class="fas fa-shield-alt" style="font-size: 1.3rem; color: var(--syntax-yellow);"></i>
                        <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--text-secondary);">Insurance</span>
                    </div>
                </div>
            </div>

            <!-- Core Values — Config File Style -->
            <div class="card" style="margin-top: 24px;">
                <h3 style="text-align: center; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; font-size: 1rem; color: var(--text-secondary);"><span style="color: var(--syntax-green);">></span> cat values.yml</h3>
                <div class="about-values">
                    <div class="about-value-item">
                        <i class="fas fa-heart" style="color: var(--syntax-red);"></i>
                        <div>
                            <strong>customer_first:</strong>
                            <p>Every decision revolves around creating the best experience for our riders.</p>
                        </div>
                    </div>
                    <div class="about-value-item">
                        <i class="fas fa-handshake" style="color: var(--syntax-blue);"></i>
                        <div>
                            <strong>trust_and_transparency:</strong>
                            <p>No hidden costs, no surprises. What you see is what you pay — always.</p>
                        </div>
                    </div>
                    <div class="about-value-item">
                        <i class="fas fa-rocket" style="color: var(--syntax-orange);"></i>
                        <div>
                            <strong>innovation:</strong>
                            <p>Continuously improving with the latest technology for a smoother ride.</p>
                        </div>
                    </div>
                    <div class="about-value-item">
                        <i class="fas fa-users" style="color: var(--syntax-green);"></i>
                        <div>
                            <strong>community:</strong>
                            <p>Building a network of responsible drivers and vehicle owners across India.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Documentation Link -->
            <div class="card" style="margin-top: 24px; text-align: center; padding: 32px;">
                <div style="margin-bottom: 16px;">
                    <i class="fas fa-book" style="font-size: 2rem; color: var(--syntax-blue);"></i>
                </div>
                <h4 style="margin-bottom: 8px;">Need Help Getting Started?</h4>
                <p style="color: var(--text-secondary); margin-bottom: 20px; font-size: 0.9rem;">Browse vehicles, select dates, and book — it's that simple.</p>
                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="app.showPage('vehiclesBrowse'); vehiclesModule.loadVehicles();" style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                        <i class="fas fa-car"></i> Browse Vehicles
                    </button>
                    <button class="btn btn-outline" onclick="app.showPage('userDashboard'); bookingModule.loadBookings();" style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                        <i class="fas fa-calendar-check"></i> My Bookings
                    </button>
                </div>
            </div>
        `;

        this.showPage('aboutPage');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new Application();
});
