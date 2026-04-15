# SmartPark Testing Guide

## Quick Start

### Login Credentials

**Receptionist:**
- Email: `reception@smartpark.com`
- Password: `password123`

**Facilities Manager:**
- Email: `manager@smartpark.com`
- Password: `password123`

**IT Admin:**
- Email: `admin@smartpark.com`
- Password: `password123`

## Testing Receptionist Dashboard

### 1. View Statistics
- Login as receptionist
- You should see 4 cards at the top:
  - Total Bookings
  - Active Today
  - Active Bookings
  - Completed

### 2. Search for Available Parking Spaces

**Steps:**
1. Select a site from dropdown (e.g., "Site A - Main Campus")
2. Pick a date (today or future date)
3. Set start time (default: 08:00)
4. Set end time (default: 17:00)
5. Click **"Search Available Spaces"** button

**Expected Result:**
- Toast message: "Searching for available spaces..."
- Visual parking grid appears below
- Shows 30 parking spaces in a grid
- Color-coded:
  - 🟢 Green = Available
  - 🔴 Red = Occupied
  - 🟡 Yellow = Reserved
- Legend shows what each color means

**If Button Not Working:**
- Open browser console (F12)
- Check for error messages
- Should see: "Searching for spaces with params:"
- Should see: "Generated demo spaces: 30"

### 3. Select a Parking Space

**Steps:**
1. After search results appear
2. Click on any **GREEN** space
3. Space turns **BLUE** (selected)
4. Blue info box appears showing:
   - Selected Space: A-ST-015 (or similar)
   - Category: standard/ev/disabled/visitor

**Expected Result:**
- Customer booking form appears below
- Selected space is highlighted in blue

### 4. Create Customer Booking

**Steps:**
1. Fill in customer details:
   - **Customer Name:** John Doe (required)
   - **Email:** john@example.com
   - **Phone:** +27123456789
   - **Company:** ABC Corp
2. Click **"Create Booking"** button

**Expected Result:**
- Success toast: "Booking created successfully for John Doe!"
- Form resets
- Parking grid disappears
- New booking appears in "Recent Bookings" list on the right

### 5. View Recent Bookings

**Location:** Right sidebar
**Shows:**
- Customer name
- Company
- Site and bay code
- Date
- Time
- Status badge (green for active)

## Testing Facilities Manager Dashboard

### 1. View Statistics
- Login as manager
- See overview cards with site statistics

### 2. View All Bookings

**Location:** Bottom of dashboard - "Recent Bookings" table

**Table Columns:**
- Customer (name)
- Company
- Site
- Bay (parking space code)
- Date
- Time
- Status
- Actions

**Expected Result:**
- See ALL bookings from database (including seed data)
- See bookings created by receptionist
- Each row shows customer details

### 3. Verify Receptionist Booking Appears

**Steps:**
1. Create booking as receptionist (see above)
2. Switch to manager dashboard (or refresh if already open)
3. Look in "Recent Bookings" table

**Expected Result:**
- New booking appears in table
- Shows customer name you entered
- Shows company you entered
- Shows selected bay code
- Status: Active (green badge)

## Troubleshooting

### Search Button Not Working

**Check:**
1. Open browser console (F12)
2. Click "Search Available Spaces"
3. Look for console logs:
   ```
   Searching for spaces with params: {site_id: "1", booking_date: "2026-04-16", ...}
   Generated demo spaces: 30
   ```

**If you see errors:**
- Check that site_id and booking_date are selected
- Should see warning toast if not selected

**If nothing happens:**
- Check browser console for JavaScript errors
- Verify frontend server is running: http://localhost:5173
- Check network tab for failed requests

### Booking Not Saving

**Check:**
1. Open browser console
2. Click "Create Booking"
3. Look for:
   - POST request to `/api/bookings`
   - Response status 200 or error message

**Common Issues:**
- Backend not running (start: `python -m uvicorn app.main:app --reload`)
- Customer name not filled (required field)
- No space selected (must click green space first)

### Booking Not Appearing on Manager Dashboard

**Check:**
1. Verify booking was created successfully (check receptionist dashboard)
2. Refresh manager dashboard
3. Check browser console for errors
4. Verify GET `/api/bookings` request succeeds

**Expected:**
- Manager dashboard calls `/api/bookings` on load
- Returns array of all bookings
- Displays in table

## API Endpoints Being Used

### Receptionist Dashboard
- `GET /api/sites` - Get list of sites
- `POST /api/spaces/search` - Search available spaces
- `GET /api/bookings` - Get all bookings (for recent list)
- `POST /api/bookings` - Create new booking

### Facilities Manager Dashboard
- `GET /api/sites` - Get list of sites
- `GET /api/bookings` - Get all bookings
- `GET /api/reports/utilization` - Get utilization stats
- `GET /api/sites/{id}/stats` - Get site statistics

## Demo Data

The system includes seed data with:
- 15 pre-existing bookings
- 3 sites (Site A, Site B, Site C)
- Multiple parking spaces per site
- Various booking statuses (active, completed, pending)

## Success Criteria

✅ Receptionist can search for spaces
✅ Visual parking grid displays
✅ Can select available spaces
✅ Can create customer bookings
✅ Bookings save to backend
✅ Bookings appear in receptionist's recent list
✅ Bookings appear in manager's table
✅ Statistics update automatically
