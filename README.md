# DriveIndia - Vehicle Rental Management System

A complete, production-level Vehicle Rental Management System for the Indian market built with modern web technologies.

## 🚀 Features

### User Features
- **User Authentication**: Secure JWT-based login and registration
- **Vehicle Browsing**: Browse and filter vehicles by type, fuel type, location, and price
- **Advanced Calendar System**: Interactive calendar with date range selection, booking visualization, and smooth animations
- **Booking Management**: Create, view, and cancel bookings
- **Payment Processing**: Dummy payment system with UPI, Card, and Wallet options
- **Booking History**: View all past and current bookings with detailed information

### Admin Features
- **Admin Dashboard**: Real-time statistics and overview
- **Vehicle Management**: Add, edit, and delete vehicles
- **Booking Management**: View and manage all customer bookings
- **Revenue Tracking**: Track simulated revenue from bookings

### Special Features
- **Glassmorphism UI**: Modern, elegant design with glass-effect components
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Mobile-first, works perfectly on all devices
- **Indian Market Focus**:
  - Currency in INR (₹)
  - GST calculation (18%)
  - Aadhaar/Driving License fields
  - Indian cities and locations
  - Mobile number support

## 💻 Tech Stack

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **No frameworks** - Pure vanilla JavaScript
- **Component-based architecture**
- **Font Awesome Icons**
- **Google Fonts (Poppins)**

### Backend
- **Node.js + Express.js**
- **JWT Authentication**
- **RESTful API**

### Database
- **MySQL**
- **Proper schema with relationships**
- **Indexing for performance**

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn** package manager
- A modern web browser

## 🔧 Installation & Setup

### 1. Database Setup

```bash
# Start MySQL service
# Windows:
net start MySQL80

# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql
```

Create the database and tables:

```bash
# Connect to MySQL
mysql -u root -p

# Run the schema
source database/schema.sql;
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=vehicle_rental_db

# Start the server
npm start

# Server will run on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Simply open index.html in a web browser
# You can use a simple HTTP server:

# Using Python
python -m http.server 3000

# Using Node.js (install http-server)
npx http-server -p 3000

# Frontend will be available at http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
GET    /api/auth/profile           - Get user profile
```

### Vehicle Endpoints

```
GET    /api/vehicles               - Get all vehicles with filters
GET    /api/vehicles/:id           - Get vehicle details
GET    /api/vehicles/locations     - Get all locations
GET    /api/vehicles/:vehicleId/available-dates - Get booked dates
```

### Booking Endpoints

```
POST   /api/bookings               - Create booking
GET    /api/bookings               - Get user bookings
GET    /api/bookings/:bookingId    - Get booking details
PUT    /api/bookings/:bookingId/cancel - Cancel booking
```

### Payment Endpoints

```
POST   /api/payments/process       - Process payment
GET    /api/payments/history       - Get payment history
```

### Admin Endpoints

```
GET    /api/admin/dashboard        - Get admin stats
POST   /api/admin/vehicles         - Add vehicle
PUT    /api/admin/vehicles/:id     - Edit vehicle
DELETE /api/admin/vehicles/:id     - Delete vehicle
GET    /api/admin/bookings         - Get all bookings
```

## 🔐 Default Admin Credentials

```
Email: admin@driveindia.com
Password: any password (demo mode)
```

## 🎛️ Project Structure

```
DriveIndia/
├── frontend/
│   ├── index.html                 # Main HTML file
│   ├── css/
│   │   ├── styles.css             # Main styles & glassmorphism theme
│   │   ├── dashboard.css          # Sidebar & layout
│   │   └── calendar.css           # Calendar component styles
│   └── js/
│       ├── api.js                 # API service
│       ├── utils.js               # Utility functions
│       ├── calendar.js            # Advanced calendar component
│       ├── components.js          # Reusable UI components
│       ├── auth.js                # Authentication module
│       ├── vehicles.js            # Vehicles module
│       ├── booking.js             # Booking module
│       ├── admin.js               # Admin module
│       └── app.js                 # Main application
│
├── backend/
│   ├── server.js                  # Express server
│   ├── package.json               # Dependencies
│   ├── .env.example               # Environment variables template
│   ├── config/
│   │   ├── database.js            # MySQL connection
│   ├── middleware/
│   │   └── auth.js                # JWT authentication
│   ├── routes/
│   │   ├── auth.js                # Auth routes
│   │   ├── vehicles.js            # Vehicle routes
│   │   ├── bookings.js            # Booking routes
│   │   ├── payments.js            # Payment routes
│   │   └── admin.js               # Admin routes
│   └── controllers/
│       ├── authController.js      # Auth logic
│       ├── vehicleController.js   # Vehicle logic
│       ├── bookingController.js   # Booking logic
│       ├── paymentController.js   # Payment logic
│       └── adminController.js     # Admin logic
│
└── database/
    └── schema.sql                 # MySQL schema & sample data
```

## 🎨 UI/UX Highlights

### Glassmorphism Design
- Semi-transparent glass-effect components
- Backdrop blur effects
- Smooth transitions and animations
- Modern color palette with gradients

### Advanced Calendar System
- Monthly view with smooth navigation
- Date range selection (check-in, check-out)
- Real-time booked date visualization
- Color-coded availability status:
  - 🟢 Green: Available
  - 🔴 Red: Booked
  - 🔵 Blue: Selected/In Range
- Hover effects and animations
- Booking summary display
- Past date disabling

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly buttons
- Adaptive sidebar for small screens

### Dark/Light Mode
- System preference detection
- Toggle switch in header
- Smooth theme transitions
- Persistent theme preference

## 💳 Dummy Payment System

The payment system uses simulated processing:
- 90% success rate for demo purposes
- Three payment methods: UPI, Card, Wallet
- Generates fake transaction IDs
- Updates booking status on successful payment

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs for password security
- **Environment Variables**: Sensitive data in .env
- **Input Validation**: Client and server-side validation
- **CORS**: Cross-Origin Resource Sharing configured
- **SQL Prepared Statements**: Protection against SQL injection

## 📊 Database Schema

### Users Table
- Full authentication support
- Aadhaar and Driving License fields
- City and address fields
- Role-based access (user/admin)

### Vehicles Table
- Complete vehicle information
- Type, fuel type, location
- Pricing per day
- Availability status
- Image URL support

### Bookings Table
- User and vehicle references
- Date range storage
- Pricing breakdown (base + GST)
- Multiple status types

### Payments Table
- Booking and user references
- Payment method tracking
- Transaction ID generation
- Payment status

## 🚀 Deployment

### Frontend Deployment
- Can be deployed to: Netlify, Vercel, GitHub Pages, AWS S3
- No build process required
- Simply upload the `frontend` folder

### Backend Deployment
- Can be deployed to: Heroku, AWS EC2, DigitalOcean, Railway
- Update `API_BASE_URL` in `api.js` for production URL
- Set environment variables on hosting platform

## 🐛 Troubleshooting

### Database Connection Error
```
Solution: Check MySQL is running and credentials in .env are correct
```

### CORS Error
```
Solution: Ensure frontend URL is added to CORS whitelist in server.js
```

### Calendar Not Displaying
```
Solution: Open browser console for errors, check calendar container ID matches
```

### Bookings Not Loading
```
Solution: Clear browser cache, check API endpoint in browser Network tab
```

## 📝 Sample Test Data

The database includes sample vehicles across major Indian cities:
- Mumbai (Cars, Bikes, Scooters)
- Delhi (Various vehicle types)
- Pune (Budget-friendly options)
- Bangalore (Premium vehicles)

## 🎓 Learning Resources

- **Express.js Documentation**: https://expressjs.com
- **MySQL Documentation**: https://dev.mysql.com/doc
- **JWT Guide**: https://jwt.io
- **Glassmorphism Design**: https://glassmorphism.com

## 📄 License

This project is provided as-is for educational purposes.

## 👨‍💻 Author

Created as a complete full-stack vehicle rental solution for the Indian market.

## 🤝 Support

For issues, questions, or improvements, please refer to the code comments and documentation.

---

**Happy Renting! 🚗**
