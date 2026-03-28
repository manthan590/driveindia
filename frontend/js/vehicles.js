/**
 * Vehicles Module
 * Handle vehicle browsing and filtering
 */

class VehiclesModule {
    constructor() {
        this.vehicles = [];
        this.locations = [];
        this.filters = {
            type: '',
            fuel_type: '',
            location: '',
            min_price: '',
            max_price: '',
            sort: 'default'
        };
    }

    async loadVehicles() {
        try {
            Spinner.show();
            const response = await api.vehicles.getAll(this.filters);
            this.vehicles = response.data;
            this.render();
            Spinner.hide();
        } catch (error) {
            Toast.error('Failed to load vehicles');
            Spinner.hide();
        }
    }

    async loadLocations() {
        try {
            const response = await api.vehicles.getLocations();
            this.locations = response.data;
        } catch (error) {
            console.error('Failed to load locations');
        }
    }

    render() {
        const vehicles_Browse = document.getElementById('vehiclesBrowse');
        if (!vehicles_Browse) return;

        const vehiclesHtml = this.vehicles.map(v => Components.vehicleCard(v)).join('');

        vehicles_Browse.innerHTML = `
            <div style="animation: fadeIn 0.3s ease-in-out;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <h2>Browse Vehicles</h2>
                    <span class="badge badge-info">${this.vehicles.length} vehicles available</span>
                </div>

                <!-- Filters -->
                <div class="card" style="margin-bottom: 32px;">
                    <div class="card-header">
                        <h5 style="margin: 0;"><i class="fas fa-filter"></i> Filters</h5>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                            <select id="filterType" class="form-control" style="padding: 10px 12px; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--glass-bg); color: var(--text-primary);">
                                <option value="">All Types</option>
                                <option value="Car">Car</option>
                                <option value="Bike">Bike</option>
                                <option value="Scooter">Scooter</option>
                            </select>

                            <select id="filterFuelType" class="form-control" style="padding: 10px 12px; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--glass-bg); color: var(--text-primary);">
                                <option value="">All Fuel Types</option>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Electric">Electric</option>
                            </select>

                            <select id="filterLocation" class="form-control" style="padding: 10px 12px; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--glass-bg); color: var(--text-primary);">
                                <option value="">All Locations</option>
                                ${this.locations.map(loc => `<option value="${loc}">${loc}</option>`).join('')}
                            </select>

                            <input type="number" id="filterMinPrice" placeholder="Min Price (₹)" min="0" style="padding: 10px 12px; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--glass-bg); color: var(--text-primary);">

                            <input type="number" id="filterMaxPrice" placeholder="Max Price (₹)" min="0" style="padding: 10px 12px; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--glass-bg); color: var(--text-primary);">

                            <select id="filterSort" class="form-control" style="padding: 10px 12px; border: 2px solid var(--border-color); border-radius: var(--radius-md); background: var(--glass-bg); color: var(--text-primary);">
                                <option value="">Default</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                            </select>

                            <button id="applyFilters" class="btn btn-primary">
                                <i class="fas fa-search"></i> Apply Filters
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Vehicles Grid -->
                <div class="grid grid-3">
                    ${vehiclesHtml}
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        // View details button
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const vehicleId = btn.dataset.vehicleId;
                app.showVehicleDetails(vehicleId);
            });
        });

        // Filter buttons
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.filters = {
                type: document.getElementById('filterType')?.value || '',
                fuel_type: document.getElementById('filterFuelType')?.value || '',
                location: document.getElementById('filterLocation')?.value || '',
                min_price: document.getElementById('filterMinPrice')?.value || '',
                max_price: document.getElementById('filterMaxPrice')?.value || '',
                sort: document.getElementById('filterSort')?.value || ''
            };

            // Remove empty filters
            Object.keys(this.filters).forEach(key => {
                if (this.filters[key] === '') delete this.filters[key];
            });

            this.loadVehicles();
        });

        // Reset filters
        document.getElementById('filterType')?.addEventListener('change', () => {
            if (document.getElementById('filterType').value === '') {
                document.getElementById('filterFuelType').value = '';
                document.getElementById('filterLocation').value = '';
                document.getElementById('filterMinPrice').value = '';
                document.getElementById('filterMaxPrice').value = '';
                this.filters = { type: '', fuel_type: '', location: '', min_price: '', max_price: '', sort: 'default' };
                this.loadVehicles();
            }
        });
    }
}

// Global vehicles module instance
const vehiclesModule = new VehiclesModule();
