-- SmartPark Database Schema
-- Intelligent Multi-Site Car Park Management System for RoppaCorp Industries

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    employee_number VARCHAR(50),
    contact_number VARCHAR(30),
    company VARCHAR(120),
    is_active BOOLEAN DEFAULT TRUE,
    is_priority BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    total_spaces INTEGER NOT NULL
);

-- Create parking_spaces table
CREATE TABLE IF NOT EXISTS parking_spaces (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    bay_code VARCHAR(20) NOT NULL,
    category VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'available',
    is_priority_only BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    pos_x INTEGER,
    pos_y INTEGER,
    UNIQUE(site_id, bay_code)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    site_id INTEGER REFERENCES sites(id),
    space_id INTEGER REFERENCES parking_spaces(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'active',
    booking_type VARCHAR(30) DEFAULT 'standard',
    is_priority BOOLEAN DEFAULT FALSE,
    approved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create visitor_bookings table
CREATE TABLE IF NOT EXISTS visitor_bookings (
    id SERIAL PRIMARY KEY,
    receptionist_id INTEGER REFERENCES users(id),
    host_user_id INTEGER REFERENCES users(id),
    visitor_name VARCHAR(120) NOT NULL,
    contact_number VARCHAR(30),
    company VARCHAR(120),
    site_id INTEGER REFERENCES sites(id),
    space_id INTEGER REFERENCES parking_spaces(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_blocks table
CREATE TABLE IF NOT EXISTS maintenance_blocks (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id),
    space_id INTEGER REFERENCES parking_spaces(id),
    reason TEXT NOT NULL,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(80),
    entity_id INTEGER,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create guidance_nodes table
CREATE TABLE IF NOT EXISTS guidance_nodes (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    node_code VARCHAR(50) NOT NULL,
    node_type VARCHAR(30) NOT NULL,
    pos_x INTEGER NOT NULL,
    pos_y INTEGER NOT NULL
);

-- Create guidance_edges table
CREATE TABLE IF NOT EXISTS guidance_edges (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
    from_node_id INTEGER REFERENCES guidance_nodes(id) ON DELETE CASCADE,
    to_node_id INTEGER REFERENCES guidance_nodes(id) ON DELETE CASCADE,
    distance NUMERIC(10,2) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_site ON parking_spaces(site_id);
CREATE INDEX IF NOT EXISTS idx_parking_spaces_status ON parking_spaces(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_site ON bookings(site_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_visitor_bookings_date ON visitor_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Insert default roles
INSERT INTO roles (name) VALUES ('employee'), ('receptionist'), ('manager'), ('admin')
ON CONFLICT (name) DO NOTHING;

-- Insert sites
INSERT INTO sites (name, total_spaces) VALUES 
    ('Site A', 127),
    ('Site B', 103),
    ('Site C', 48)
ON CONFLICT (name) DO NOTHING;
