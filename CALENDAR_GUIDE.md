# Calendar Implementation Guide

## Advanced Interactive Calendar System

The calendar system is one of the most sophisticated parts of DriveIndia. Here's a detailed breakdown:

## 📅 Calendar Features

### 1. Calendar Class

Located in `frontend/js/calendar.js`

```javascript
const calendar = new Calendar(containerId, options);
```

#### Options

```javascript
{
  vehicleId: 1,              // Vehicle ID
  bookedDates: [],           // Array of booked dates
  onDateSelect: callback,    // Called when dates selected
  selectMode: 'range'        // 'range' or 'single'
}
```

### 2. Date Selection Modes

#### Range Mode (Default)
- Select check-in and check-out dates
- Highlights dates between selection
- Shows booking summary

#### Single Mode
- Select only one date
- Useful for one-way rentals

### 3. Visual States

Each day cell can have these states:

```css
.calendar-day.available    /* Green - available */
.calendar-day.booked       /* Red - occupied */
.calendar-day.selected     /* Blue - selected dates */
.calendar-day.in-range     /* Light blue - date range */
.calendar-day.today        /* Dot indicator - today */
.calendar-day.disabled     /* Gray - past dates */
.calendar-day.empty        /* Other months */
```

### 4. Calendar Methods

```javascript
// Get selected dates
calendar.getSelectedDates()
// Returns: {startDate, endDate, days}

// Set booked dates
calendar.setBookedDates(['2024-01-15', '2024-01-16'])

// Clear selection
calendar.clearSelection()

// Navigate months
calendar.previousMonth()
calendar.nextMonth()
calendar.goToToday()

// Update booked dates dynamically
calendar.update({bookedDates: newBooked Dates})
```

### 5. Styling

All calendar styling is in `frontend/css/calendar.css`

Key CSS classes:
- `.calendar-wrapper` - Container
- `.calendar-grid` - Day grid
- `.calendar-day` - Individual day
- `.calendar-legend` - Key/legend
- `.booking-summary` - Summary display

### 6. Integration Example

```javascript
// In vehicle details page
const calendar = new Calendar('calendar', {
    vehicleId: vehicleId,
    bookedDates: bookedDates,
    onDateSelect: (dates) => {
        // Handle date selection
        console.log('Selected:', dates);
        // Update your booking form
        // Enable checkout button
    }
});
```

### 7. Booked Dates Fetching

```javascript
// Get booked dates from API
const response = await api.vehicles.getAvailableDates(vehicleId, month, year);
const bookedDates = response.bookedDates;

// Update calendar
calendar.setBookedDates(bookedDates);
```

### 8. Animations

- Smooth month transitions
- Day selection feedback
- Hover effects on available dates
- Summary panel slide-up animation

### 9. Responsive Behavior

- Mobile: Single column calendar
- Tablet: Proper text sizing
- Desktop: Full interactive experience

### 10. Accessibility Features

- Keyboard navigation ready
- Color + icons (not just color)
- Clear visual hierarchy
- Semantic HTML structure

## 🎯 Calendar Logic Flow

```
1. Initialize Calendar
   ↓
2. Fetch Booked Dates from API
   ↓
3. Render Days with appropriate classes
   ↓
4. Attach Event Listeners
   ↓
5. User clicks available date
   ↓
6. Validate and update selection
   ↓
7. Re-render with new highlights
   ↓
8. Display booking summary
   ↓
9. Call onDateSelect callback
```

## 📊 Calendar Rendering Process

```javascript
// 1. Get month boundaries
const year = currentDate.getFullYear();
const month = currentDate.getMonth();
const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);

// 2. Generate day cells
// - Previous month's trailing days
// - Current month's days with classes
// - Next month's leading days

// 3. Apply classes based on:
// - Is it today?
// - Is it in past? → disabled
// - Is it booked? → booked
// - Is it selected? → selected
// - Is it in range? → in-range
// - Otherwise → available

// 4. Attach click listeners
// 5. Render legend
// 6. Render booking summary (if dates selected)
```

## 🎨 Color Scheme

```css
Available:   #10b981 (Green)
Booked:      #ef4444 (Red)
Selected:    #6366f1 (Primary Blue)
In Range:    rgba(99, 102, 241, 0.15)
Today:       #06b6d4 (Cyan dot)
Disabled:    #94a3b8 (Gray)
```

## ⚡ Performance Optimizations

1. **Event Delegation**: Single listener on grid
2. **Class Toggling**: Instead of DOM recreation
3. **Date Objects**: Cached for comparison
4. **CSS Transitions**: Hardware-accelerated
5. **Efficient Re-renders**: Only when necessary

## 🔧 Customization Ideas

### Change Colors
Edit `:root` variables in `css/calendar.css`:
```css
--success: #YOUR_COLOR;
--danger: #YOUR_COLOR;
```

### Add Languages
Modify arrays in `calendar.js`:
```javascript
const weekdays = ['Sun', 'Mon', ...]; // Change labels
const months = ['January', ...];       // Change month names
```

### Disable Holidays
Add to booked dates:
```javascript
const holidays = ['2024-01-26', '2024-03-08'];
calendar.setBookedDates([...bookedDates, ...holidays]);
```

### Add Time Selection
Extend calendar with time pickers in the booking summary

## 🐛 Common Issues & Solutions

### Dates not updating
```javascript
// Always call calendar.update() after API call
calendar.update({bookedDates: newDates});
```

### Calendar not rendering
```javascript
// Check container exists and ID matches
if (!document.getElementById('calendar')) {
    // Create it first
}
```

### Timezone issues
```javascript
// Use ISO format consistently
const dateStr = new Date().toISOString().split('T')[0];
```

## 📱 Mobile Considerations

- Touch-friendly cell sizes (minimum 44x44px)
- Large month navigation buttons
- Readable font sizes
- Horizontal scroll for table view
- Simplified touch interactions

## 🎯 Future Enhancements

1. Add time selection (hourly/half-day)
2. Keyboard navigation (arrow keys)
3. Week view option
4. Multiple calendar sync
5. Ical export
6. Holidays API integration
7. Custom business days
8. Seasonal pricing highlights

---

**Calendar Implementation Complete!** 🎉

The calendar is production-grade with smooth animations, accessibility, and responsive design throughout.
