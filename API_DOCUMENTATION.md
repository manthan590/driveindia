# Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 📋 Endpoints Reference

### Authentication

#### Register User
```
POST /auth/register

Request:
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "confirm_password": "password123",
  "aadhaar_number": "123456789012",
  "driving_license": "DL123456",
  "city": "Mumbai"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "token": "eyJhbGc..."
  }
}
```

#### Login User
```
POST /auth/login

Request:
{
  "email_or_phone": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "user",
    "token": "eyJhbGc..."
  }
}
```

#### Get User Profile
```
GET /auth/profile
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "aadhaar_number": "123456789012",
    "driving_license": "DL123456",
    "address": "123 Main St",
    "city": "Mumbai",
    "role": "user",
    "verified": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Vehicles

#### Get All Vehicles
```
GET /vehicles?type=Car&fuel_type=Petrol&location=Mumbai&min_price=1000&max_price=5000&sort=price_asc

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "Maruti Swift",
      "type": "Car",
      "fuel_type": "Petrol",
      "price_per_day": 1500,
      "location": "Mumbai",
      "availability_status": true,
      "image_url": "https://...",
      "registration_number": "MH01AB1234",
      "capacity": 5,
      "kilometers_run": 0,
      "description": "Compact car, automatic transmission"
    }
  ]
}
```

#### Get Vehicle by ID
```
GET /vehicles/:id

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Maruti Swift",
    "type": "Car",
    "fuel_type": "Petrol",
    "price_per_day": 1500,
    ...
  }
}
```

#### Get Available Dates
```
GET /vehicles/:vehicleId/available-dates?month=1&year=2024

Response:
{
  "success": true,
  "vehicleId": 1,
  "bookedDates": ["2024-01-15", "2024-01-16", "2024-01-20"],
  "availableDates": "All dates not in bookedDates array"
}
```

#### Get Locations
```
GET /vehicles/locations

Response:
{
  "success": true,
  "data": ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"]
}
```

---

### Bookings

#### Create Booking
```
POST /bookings
Headers: Authorization: Bearer <token>

Request:
{
  "vehicle_id": 1,
  "start_date": "2024-02-15",
  "end_date": "2024-02-20",
  "pickup_location": "Mumbai Central",
  "dropoff_location": "Mumbai Airport"
}

Response:
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "bookingId": 5,
    "vehicleId": 1,
    "totalDays": 5,
    "basePrice": 7500,
    "gstAmount": 1350,
    "totalAmount": 8850,
    "status": "Pending"
  }
}
```

#### Get User Bookings
```
GET /bookings
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 5,
      "user_id": 1,
      "vehicle_id": 1,
      "vehicle_name": "Maruti Swift",
      "vehicle_type": "Car",
      "image_url": "https://...",
      "start_date": "2024-02-15",
      "end_date": "2024-02-20",
      "total_days": 5,
      "base_price": 7500,
      "gst_amount": 1350,
      "total_amount": 8850,
      "status": "Pending",
      "created_at": "2024-01-10T14:30:00Z"
    }
  ]
}
```

#### Get Booking Details
```
GET /bookings/:bookingId
Headers: Authorization: Bearer <token>

Response: (detailed booking object with user and vehicle info)
```

#### Cancel Booking
```
PUT /bookings/:bookingId/cancel
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

### Payments

#### Process Payment
```
POST /payments/process
Headers: Authorization: Bearer <token>

Request:
{
  "booking_id": 5,
  "payment_method": "UPI"  // UPI, Card, or Wallet
}

Response (Success):
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "paymentId": 10,
    "transactionId": "TXN1705934400123ABC",
    "amount": 8850,
    "status": "Success",
    "bookingStatus": "Confirmed"
  }
}

Response (Dummy Failure - 10% chance):
{
  "success": false,
  "message": "Payment failed. Please try again.",
  "data": {
    "transactionId": "TXN1705934400123ABC",
    "status": "Failed"
  }
}
```

#### Get Payment History
```
GET /payments/history
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 10,
      "booking_id": 5,
      "user_id": 1,
      "payment_method": "UPI",
      "amount": 8850,
      "transaction_id": "TXN...",
      "status": "Success",
      "booking_amount": 8850,
      "vehicle_name": "Maruti Swift",
      "payment_date": "2024-01-10T15:00:00Z"
    }
  ]
}
```

---

### Admin

#### Get Dashboard Stats (Admin Only)
```
GET /admin/dashboard
Headers: Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "totalBookings": 47,
    "totalVehicles": 8,
    "totalRevenue": 125000,
    "completedBookings": 30,
    "pendingBookings": 10
  }
}
```

#### Add Vehicle
```
POST /admin/vehicles
Headers: Authorization: Bearer <admin_token>

Request:
{
  "name": "Toyota Fortuner",
  "type": "Car",
  "fuel_type": "Diesel",
  "price_per_day": 4500,
  "location": "Mumbai",
  "image_url": "https://...",
  "registration_number": "MH06XY7890",
  "capacity": 7,
  "description": "Premium SUV with all features"
}

Response:
{
  "success": true,
  "message": "Vehicle added successfully",
  "data": {
    "id": 9,
    "name": "Toyota Fortuner",
    ...
  }
}
```

#### Edit Vehicle
```
PUT /admin/vehicles/:vehicleId
Headers: Authorization: Bearer <admin_token>

Request: (Any fields to update)
{
  "price_per_day": 5000,
  "availability_status": false
}

Response:
{
  "success": true,
  "message": "Vehicle updated successfully"
}
```

#### Delete Vehicle
```
DELETE /admin/vehicles/:vehicleId
Headers: Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

#### Get All Bookings (Admin)
```
GET /admin/bookings?status=Pending&page=1&limit=10
Headers: Authorization: Bearer <admin_token>

Response:
{
  "success": true,
  "data": [...bookings],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47
  }
}
```

---

## 🔑 Error Responses

```
400 Bad Request
{
  "success": false,
  "message": "Error description"
}

401 Unauthorized
{
  "success": false,
  "message": "No token provided" or "Invalid or expired token"
}

403 Forbidden
{
  "success": false,
  "message": "Admin access required"
}

404 Not Found
{
  "success": false,
  "message": "Resource not found"
}

409 Conflict
{
  "success": false,
  "message": "Vehicle is not available for selected dates"
}

500 Internal Server Error
{
  "success": false,
  "message": "Internal server error",
  "error": {...}
}
```

---

## 📊 Data Types

### Vehicle Types
- `Car`
- `Bike`
- `Scooter`

### Fuel Types
- `Petrol`
- `Diesel`
- `Electric`

### Booking Status
- `Pending` - Waiting for payment
- `Confirmed` - Payment received
- `Ongoing` - Currently rented
- `Completed` - Rental period finished
- `Cancelled` - Booking cancelled

### Payment Status
- `Pending` - Payment processing
- `Success` - Payment completed
- `Failed` - Payment failed

### Payment Methods
- `UPI`
- `Card`
- `Wallet`

---

## 💡 Tips

1. **Rate Limiting**: None implemented for demo, add for production
2. **Pagination**: Available on admin bookings endpoint
3. **Filtering**: Common on vehicles and bookings
4. **Sorting**: Available on vehicles (price_asc, price_desc)
5. **CORS**: Configured for localhost:3000, update for production

---

**Last Updated**: January 2024
