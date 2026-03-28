# DriveIndia - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Database
```bash
# Create database
mysql -u root -p < database/schema.sql
```

### Step 2: Backend
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Step 3: Frontend
```bash
cd frontend
# Option A: Using Python
python -m http.server 3000

# Option B: Using Node
npx http-server -p 3000

# Open browser: http://localhost:3000
```

## 🧪 Test the Application

### Admin Login
- Email: `admin@driveindia.com`
- Password: `any password`
- Role: Admin (full access to dashboard)

### User Action Flow
1. Click "Register here" on login page
2. Fill in registration form with sample data
3. Login with your credentials
4. Browse available vehicles
5. Select dates using the calendar
6. Proceed to checkout
7. Complete dummy payment
8. View booking in "My Bookings"

## 📱 Features to Try

### Calendar System
- Click "Browse Vehicles" → Select any vehicle
- Try the interactive, animated calendar
- Select check-in and check-out dates
- Watch the booking summary update in real-time
- See red dates (booked) and green dates (available)

### Payment System
- Go to any pending booking
- Click "Pay Now"
- Select UPI, Card, or Wallet
- Complete payment simulation
- Receive fake transaction ID

### Filters
- Navigate to "Browse Vehicles"
- Filter by type (Car/Bike/Scooter)
- Filter by fuel type
- Filter by location
- Sort by price

### Dark Mode
- Click moon icon in header
- Smooth theme transition
- All components adapted for dark mode

## 🔍 Browser Console

Open Developer Tools (F12) to see:
- API calls and responses
- Calendar selection logs
- Authentication tokens
- Error diagnostics

## 📞 Common Tasks

### Add a New Vehicle (Admin)
1. Login as admin
2. Dashboard → "Add Vehicle"
3. Fill details and save
4. Vehicle appears in browse list immediately

### Cancel a Booking (User)
1. Go to "My Bookings"
2. Click "Cancel" on any pending booking
3. Confirm cancellation
4. Status updates to "Cancelled"

### View Admin Stats
1. Login as admin
2. Dashboard shows:
   - Total users
   - Total bookings
   - Total vehicles
   - Total revenue (simulated)

## 🎨 Responsive Design Test

Resize browser to test responsiveness:
- **Desktop**: 1920px+ - Full layout
- **Tablet**: 768px - 1024px - Grid adjusts
- **Mobile**: < 768px - Single column, collapsible sidebar

## 🐞 Debug Mode

Check browser Network tab to see all API calls:
- `/api/vehicles` - Get vehicle list
- `/api/bookings` - User bookings
- `/api/payments/process` - Payment simulation
- `/api/admin/dashboard` - Admin stats

## 📊 Database Test

Access MySQL directly:
```bash
mysql -u root -p
USE vehicle_rental_db;
SELECT * FROM vehicles;
SELECT * FROM bookings;
SELECT * FROM payments;
```

## ✅ Verification Checklist

- [ ] MySQL initialized with schema
- [ ] Backend server running (port 5000)
- [ ] Frontend loading (port 3000)
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Calendar displays and accepts date selection
- [ ] Vehicles list shows sample data
- [ ] Payment form displays correctly
- [ ] Dark mode toggles smoothly
- [ ] Admin can view all stats

## 🆘 Quick Fixes

### "Cannot GET" error
→ Start frontend server in correct directory

### "Connection refused" on backend
→ Ensure MySQL is running and backend server is started

### Empty vehicles list
→ Run schema.sql again with sample data insertion

### Payment button not working
→ Check browser console for JavaScript errors

### Styling looks broken
→ Clear browser cache (Ctrl+Shift+Delete)

## 🎓 Next Steps

- Modify sample data in schema.sql
- Add more cities/locations
- Customize color themes in CSS
- Extend payment methods
- Add email notifications
- Integrate real payment gateway
- Add vehicle image uploads

---

**You're all set! Start exploring DriveIndia now! 🚗✨**
