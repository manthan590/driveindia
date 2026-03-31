/**
 * Reusable UI Components
 * HTML generators for common UI elements
 */

class Components {
    // Resolve image URL (handles relative /uploads/ paths and full http URLs)
    static getImageUrl(url) {
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

    // Create vehicle card
    static vehicleCard(vehicle) {
        const pricePerDay = formatUtils.formatCurrency(vehicle.price_per_day);
        const imgUrl = this.getImageUrl(vehicle.image_url);
        const typeIcon = vehicle.type === 'Car' ? 'fa-car' : vehicle.type === 'Bike' ? 'fa-motorcycle' : 'fa-motorcycle';
        return `
            <div class="card vehicle-card" data-vehicle-id="${vehicle.id}">
                <div class="card-image" style="background: linear-gradient(135deg, #1e293b, #334155); height: 200px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 16px; position: relative;">
                    <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;" class="img-fallback">
                        <i class="fas ${typeIcon}" style="font-size:3rem;color:rgba(255,255,255,0.15);margin-bottom:8px;"></i>
                        <span style="color:rgba(255,255,255,0.25);font-family:'JetBrains Mono',monospace;font-size:0.8rem;">${vehicle.name}</span>
                    </div>
                    ${imgUrl ? `<img src="${imgUrl}" alt="${vehicle.name}" style="width:100%;height:100%;object-fit:cover;position:relative;z-index:1;" onerror="this.remove();">` : ''}
                </div>
                <div class="card-body">
                    <h4>${vehicle.name}</h4>
                    <p style="margin: 8px 0; font-size: 0.9rem;"><i class="fas fa-${this.getTypeIcon(vehicle.type)}"></i> ${vehicle.type}</p>
                    <p style="margin: 4px 0; font-size: 0.85rem; color: var(--text-tertiary);"><i class="fas fa-gas-pump"></i> ${vehicle.fuel_type}</p>
                    <p style="margin: 4px 0; font-size: 0.85rem; color: var(--text-tertiary);"><i class="fas fa-map-marker-alt"></i> ${vehicle.location}</p>
                    <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                        <span class="badge badge-success">${pricePerDay}/day</span>
                        <span class="badge badge-info">Seats: ${vehicle.capacity}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-small view-details" data-vehicle-id="${vehicle.id}">
                        <i class="fas fa-arrow-right"></i> View Details
                    </button>
                </div>
            </div>
        `;
    }

    // Get vehicle type icon
    static getTypeIcon(type) {
        const icons = {
            'Car': 'car',
            'Bike': 'motorcycle',
            'Scooter': 'motorcycle'
        };
        return icons[type] || 'car';
    }

    // Create vehicle details section
    static vehicleDetails(vehicle, bookedDates = []) {
        const pricePerDay = formatUtils.formatCurrency(vehicle.price_per_day);
        const imgUrl = this.getImageUrl(vehicle.image_url);
        const typeIcon = vehicle.type === 'Car' ? 'fa-car' : vehicle.type === 'Bike' ? 'fa-motorcycle' : 'fa-motorcycle';
        return `
            <div class="grid grid-2">
                <div>
                    <div class="card">
                        <div style="background: linear-gradient(135deg, #1e293b, #334155); height: 300px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 16px; position: relative;">
                            <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;position:absolute;top:0;left:0;">
                                <i class="fas ${typeIcon}" style="font-size:5rem;color:rgba(255,255,255,0.15);margin-bottom:12px;"></i>
                                <span style="color:rgba(255,255,255,0.25);font-family:'JetBrains Mono',monospace;font-size:1rem;">${vehicle.name}</span>
                            </div>
                            ${imgUrl ? `<img src="${imgUrl}" alt="${vehicle.name}" style="width:100%;height:100%;object-fit:cover;position:relative;z-index:1;" onerror="this.remove();">` : ''}
                        </div>
                        <div class="card-body">
                            <h3>${vehicle.name}</h3>
                            <p>${vehicle.description}</p>
                            <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">Type</p>
                                    <p style="font-weight: 600; color: var(--text-primary);">${vehicle.type}</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">Fuel Type</p>
                                    <p style="font-weight: 600; color: var(--text-primary);">${vehicle.fuel_type}</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">Location</p>
                                    <p style="font-weight: 600; color: var(--text-primary);">${vehicle.location}</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">Seating</p>
                                    <p style="font-weight: 600; color: var(--text-primary);">${vehicle.capacity} persons</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">Registration</p>
                                    <p style="font-weight: 600; color: var(--text-primary);">${vehicle.registration_number}</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">Runs</p>
                                    <p style="font-weight: 600; color: var(--text-primary);">${vehicle.kilometers_run} km</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div class="card">
                        <h4 style="margin-bottom: 16px;"><i class="fas fa-calendar-check"></i> Select Dates</h4>
                        <div id="calendar"></div>
                    </div>

                    <div class="card" style="margin-top: 20px;">
                        <div class="card-header">
                            <h5 style="margin: 0;">Pricing Details</h5>
                            <span class="badge badge-primary">${pricePerDay}/day</span>
                        </div>
                        <div class="card-body">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">Daily Rate</p>
                                    <p style="font-weight: 600; color: var(--text-primary);">${pricePerDay}</p>
                                </div>
                                <div>
                                    <p style="color: var(--text-tertiary); font-size: 0.9rem;">GST Rate</p>
                                    <p style="font-weight: 600; color: var(--text-primary);">18%</p>
                                </div>
                            </div>
                            <button class="btn btn-primary w-full" style="margin-top: 16px;" id="proceedToBooking">
                                <i class="fas fa-check"></i> Proceed to Booking
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create booking card
    static bookingCard(booking) {
        const totalAmount = formatUtils.formatCurrency(booking.total_amount);
        const basePrice = formatUtils.formatCurrency(booking.base_price);
        const gstAmount = formatUtils.formatCurrency(booking.gst_amount);
        const startDate = formatUtils.formatDate(booking.start_date);
        const endDate = formatUtils.formatDate(booking.end_date);

        const statusBadgeClass = {
            'Pending': 'badge-warning',
            'Confirmed': 'badge-success',
            'Ongoing': 'badge-info',
            'Completed': 'badge-secondary',
            'Cancelled': 'badge-danger'
        }[booking.status] || 'badge-secondary';

        return `
            <div class="card booking-card" data-booking-id="${booking.id}">
                <div class="card-header">
                    <div>
                        <h4>${booking.vehicle_name}</h4>
                        <p style="margin: 4px 0; color: var(--text-tertiary); font-size: 0.9rem;">${booking.vehicle_type} • Booking #${booking.id}</p>
                    </div>
                    <span class="badge ${statusBadgeClass}">${booking.status}</span>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 0.85rem; text-transform: uppercase;">Check-in</p>
                            <p style="font-weight: 600;">${startDate}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 0.85rem; text-transform: uppercase;">Check-out</p>
                            <p style="font-weight: 600;">${endDate}</p>
                        </div>
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 0.85rem; text-transform: uppercase;">Duration</p>
                            <p style="font-weight: 600;">${booking.total_days} days</p>
                        </div>
                        <div>
                            <p style="color: var(--text-tertiary); font-size: 0.85rem; text-transform: uppercase;">Total Amount</p>
                            <p style="font-weight: 700; color: var(--primary);">${totalAmount}</p>
                        </div>
                    </div>
                    <div style="background: var(--bg-secondary); padding: 12px; border-radius: var(--radius-md); font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Base Price:</span>
                            <span>${basePrice}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
                            <span>GST (18%):</span>
                            <span>${gstAmount}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-weight: 700; margin-top: 8px;">
                            <span>Total:</span>
                            <span>${totalAmount}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-small btn-outline view-booking-details" data-booking-id="${booking.id}">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${booking.status === 'Pending' ? `
                        <button class="btn btn-small btn-primary pay-now" data-booking-id="${booking.id}">
                            <i class="fas fa-credit-card"></i> Pay Now
                        </button>
                    ` : ''}
                    ${booking.status !== 'Completed' && booking.status !== 'Cancelled' ? `
                        <button class="btn btn-small btn-danger cancel-booking" data-booking-id="${booking.id}">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Create payment form
    static paymentForm(bookingId, totalAmount) {
        const totalAmountFormatted = formatUtils.formatCurrency(totalAmount);
        return `
            <div class="card">
                <div class="card-header">
                    <h4>Payment Details</h4>
                    <span class="badge badge-primary">${totalAmountFormatted}</span>
                </div>
                <div class="card-body">
                    <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 20px; border-radius: var(--radius-lg); margin-bottom: 20px;">
                        <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">Amount to Pay</p>
                        <h2 style="margin: 8px 0; color: white;">${totalAmountFormatted}</h2>
                    </div>

                    <form id="paymentForm">
                        <label style="margin-bottom: 16px;">Select Payment Method</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                            <label style="cursor: pointer; padding: 16px; border: 2px solid var(--border-color); border-radius: var(--radius-md); text-align: center; transition: var(--transition);" class="payment-method-label">
                                <input type="radio" name="payment_method" value="UPI" required>
                                <div style="margin-top: 8px;">
                                    <i class="fas fa-mobile-alt" style="font-size: 1.5rem; color: var(--primary);"></i>
                                    <p style="margin: 8px 0 0 0; font-weight: 600;">UPI</p>
                                </div>
                            </label>
                            <label style="cursor: pointer; padding: 16px; border: 2px solid var(--border-color); border-radius: var(--radius-md); text-align: center; transition: var(--transition);" class="payment-method-label">
                                <input type="radio" name="payment_method" value="Card" required>
                                <div style="margin-top: 8px;">
                                    <i class="fas fa-credit-card" style="font-size: 1.5rem; color: var(--secondary);"></i>
                                    <p style="margin: 8px 0 0 0; font-weight: 600;">Card</p>
                                </div>
                            </label>
                            <label style="cursor: pointer; padding: 16px; border: 2px solid var(--border-color); border-radius: var(--radius-md); text-align: center; transition: var(--transition);" class="payment-method-label">
                                <input type="radio" name="payment_method" value="Wallet" required>
                                <div style="margin-top: 8px;">
                                    <i class="fas fa-wallet" style="font-size: 1.5rem; color: var(--success);"></i>
                                    <p style="margin: 8px 0 0 0; font-weight: 600;">Wallet</p>
                                </div>
                            </label>
                        </div>

                        <p style="padding: 12px; background: rgba(99, 102, 241, 0.1); border-radius: var(--radius-md); color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
                            <i class="fas fa-info-circle"></i> This is a dummy payment system for demonstration purposes.
                        </p>

                        <button type="submit" class="btn btn-success w-full" id="paymentSubmitBtn">
                            <i class="fas fa-lock"></i> Complete Payment
                        </button>
                    </form>
                </div>
            </div>
        `;
    }
}

// Payment method selection styling
document.addEventListener('change', function(e) {
    if (e.target.name === 'payment_method') {
        document.querySelectorAll('.payment-method-label').forEach(label => {
            label.style.borderColor = 'var(--border-color)';
            label.style.backgroundColor = 'transparent';
        });
        e.target.closest('.payment-method-label').style.borderColor = 'var(--primary)';
        e.target.closest('.payment-method-label').style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
    }
});
