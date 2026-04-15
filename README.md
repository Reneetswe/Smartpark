# SmartPark - Intelligent Multi-Site Car Park Management System

A comprehensive full-stack car park management system for RoppaCorp Industries, managing three sites with real-time parking visibility, role-based access control, and smart bay guidance.

## 🚀 Features

### Core Functionality
- **Multi-Site Management**: Manage parking across Site A (127 spaces), Site B (103 spaces), and Site C (48 spaces)
- **Real-Time Availability**: Live parking space status across all sites
- **Smart Booking System**: Search, book, and manage parking reservations
- **Visitor Management**: Dedicated receptionist interface for visitor parking
- **Bay Guidance**: Visual navigation system to guide users to their booked parking bay
- **Role-Based Access Control**: Four distinct user roles with specific permissions

### User Roles

#### 1. Employee/Customer
- Search available parking spaces by site, date, time, and category
- Book parking spaces
- View and manage personal bookings
- Cancel or modify bookings
- Access visual guidance to booked bay

#### 2. Receptionist/Admin
- Create and manage visitor bookings
- Search parking spaces for visitors
- View site layouts
- Manage visitor information (name, contact, company, host employee)

#### 3. Facilities Manager
- Centralized dashboard for all sites
- View occupancy statistics and utilization rates
- Approve/reject special booking requests
- Override bookings when necessary
- Block spaces for maintenance, events, or VIP use
- Generate and export reports
- Monitor alerts for capacity and maintenance issues

#### 4. IT Admin/System Admin
- Complete user management (create, edit, deactivate users)
- Assign and modify user roles
- View comprehensive audit logs
- Monitor system activity
- Manage system settings

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Font**: Lato (Google Fonts)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLAlchemy
- **Authentication**: JWT with python-jose
- **Password Hashing**: passlib with bcrypt
- **Validation**: Pydantic

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **Python**: 3.9 or higher
- **PostgreSQL**: Neon database account or local PostgreSQL instance
- **npm** or **yarn**: Package manager

## 🔧 Installation & Setup

### 1. Clone or Navigate to Project

```bash
cd "C:/Users/Reneetswe windows/CascadeProjects/SmartPark"
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://username:password@host/database
SECRET_KEY=your-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:5173
```

**For Neon PostgreSQL:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Use it as your `DATABASE_URL`

#### Initialize Database

The database tables will be created automatically when you run the application for the first time.

#### Seed Demo Data

```bash
python app/seed.py
```

This will populate the database with:
- 4 user roles (employee, receptionist, manager, admin)
- 3 sites with parking spaces
- Demo users for each role
- Sample bookings and maintenance blocks
- Guidance nodes and routes

### 3. Frontend Setup

#### Install Node Dependencies

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: `http://localhost:8000`
API Documentation (Swagger): `http://localhost:8000/docs`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The application will be available at: `http://localhost:5173`

## 👥 Demo Credentials

Use these credentials to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@smartpark.com | password123 |
| Receptionist | reception@smartpark.com | password123 |
| Manager | manager@smartpark.com | password123 |
| Admin | admin@smartpark.com | password123 |

## 📊 Database Schema

### Main Tables

1. **roles** - User role definitions
2. **users** - User accounts with role assignments
3. **sites** - Parking site information
4. **parking_spaces** - Individual parking bays
5. **bookings** - Employee parking reservations
6. **visitor_bookings** - Visitor parking managed by receptionists
7. **maintenance_blocks** - Maintenance schedules for parking spaces
8. **activity_logs** - Audit trail of system actions
9. **guidance_nodes** - Navigation waypoints for each site
10. **guidance_edges** - Routes between navigation nodes

### Parking Categories

- **Standard**: Regular parking spaces
- **EV**: Electric vehicle charging bays
- **Disabled**: Accessible parking spaces
- **Visitor**: Designated visitor parking

### Space Distribution

**Site A (127 spaces)**:
- 21 EV
- 16 Disabled
- 12 Visitor
- 78 Standard

**Site B (103 spaces)**:
- 14 EV
- 10 Disabled
- 8 Visitor
- 71 Standard

**Site C (48 spaces)**:
- 12 EV
- 8 Disabled
- 8 Visitor
- 20 Standard

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API endpoints
- Secure credential storage
- Activity logging for audit trails

## 📱 Key Features by Page

### Landing Page (`/`)
- Modern hero section
- Site overview cards
- Feature highlights
- Call-to-action buttons

### Login Page (`/login`)
- Email/password authentication
- Show/hide password toggle
- Demo credentials display
- Role-based redirect after login

### Employee Dashboard (`/employee`)
- Advanced search filters
- Available space listings
- Personal booking management
- Quick access to bay guidance

### Receptionist Dashboard (`/reception`)
- Visitor booking creation
- Host employee selection
- Visitor information management
- Active booking overview

### Manager Dashboard (`/manager`)
- Multi-site statistics dashboard
- Occupancy charts and graphs
- Booking approval workflow
- System alerts and notifications
- Report generation

### Admin Dashboard (`/admin`)
- User CRUD operations
- Role assignment
- Activity log viewer
- System monitoring

### Guidance Page (`/guidance/:bookingId`)
- Visual site layout map
- Highlighted booked bay
- Route visualization
- Turn-by-turn instructions
- Interactive legend

## 🎨 Design Philosophy

- **Clean & Modern**: Premium SaaS-style interface
- **Responsive**: Mobile-first design approach
- **Accessible**: WCAG compliant color contrasts
- **Intuitive**: Clear navigation and user flows
- **Professional**: Enterprise-grade UI components

## 📈 Reporting Features

### Available Reports
- Occupancy by site and date range
- Utilization rates per site
- Peak usage times analysis
- Category-wise distribution
- Maintenance tracking
- Alert generation for capacity issues

## 🔄 Business Rules

1. Users can only book available spaces
2. Disabled bays require special permissions
3. EV bays are reserved for EV category requests
4. Visitor bays are primarily for visitor bookings
5. Receptionists cannot override priority bookings
6. Managers can approve/reject special requests
7. Space availability updates in real-time
8. No overlapping bookings for same bay and time
9. All critical actions are logged

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `PATCH /api/users/{id}/deactivate` - Deactivate user

### Sites
- `GET /api/sites` - List all sites
- `GET /api/sites/{id}/stats` - Get site statistics

### Parking Spaces
- `GET /api/spaces` - List spaces
- `POST /api/spaces/search` - Search available spaces
- `PATCH /api/spaces/{id}/block` - Block space

### Bookings
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/my` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/{id}/cancel` - Cancel booking
- `PATCH /api/bookings/{id}/approve` - Approve booking

### Visitor Bookings
- `GET /api/visitor-bookings` - List visitor bookings
- `POST /api/visitor-bookings` - Create visitor booking

### Reports
- `GET /api/reports/occupancy` - Occupancy report
- `GET /api/reports/utilization` - Utilization report
- `GET /api/reports/alerts` - System alerts

### Logs
- `GET /api/logs` - Activity logs

### Guidance
- `GET /api/guidance/{booking_id}` - Get navigation data

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**
- Verify DATABASE_URL is correct
- Check Neon database is active
- Ensure network connectivity

**Import Errors**
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version`

### Frontend Issues

**Module Not Found**
- Delete `node_modules` and reinstall: `npm install`
- Clear npm cache: `npm cache clean --force`

**API Connection Error**
- Verify backend is running on port 8000
- Check VITE_API_URL in `.env`
- Verify CORS settings in backend

## 📦 Building for Production

### Backend

```bash
# Use a production WSGI server
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend

```bash
npm run build
```

The production build will be in the `dist` folder.

## 🤝 Contributing

This is a prototype system for RoppaCorp Industries. For production deployment:

1. Update all secret keys and passwords
2. Configure production database
3. Set up proper SSL/TLS certificates
4. Implement rate limiting
5. Add comprehensive error handling
6. Set up monitoring and logging
7. Configure backup strategies

## 📄 License

Proprietary - RoppaCorp Industries

## 👨‍💻 Support

For technical support or questions about SmartPark, contact the IT department at RoppaCorp Industries.

---

**SmartPark** - Intelligent Parking Management for the Modern Enterprise
