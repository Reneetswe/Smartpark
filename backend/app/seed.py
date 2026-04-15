from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import *
from app.utils.auth import get_password_hash
from datetime import date, time, datetime, timedelta
import random

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("Seeding roles...")
        # Only 3 roles: receptionist, manager (facilities), admin (IT)
        roles_data = ["receptionist", "manager", "admin"]
        roles = {}
        for role_name in roles_data:
            existing_role = db.query(Role).filter(Role.name == role_name).first()
            if not existing_role:
                role = Role(name=role_name)
                db.add(role)
                db.commit()
                db.refresh(role)
                roles[role_name] = role
            else:
                roles[role_name] = existing_role
        
        print("Seeding users...")
        # Only 3 users: receptionist, facilities manager, IT admin
        users_data = [
            {
                "full_name": "Sarah Receptionist",
                "email": "reception@smartpark.com",
                "password": "password123",
                "role": "receptionist",
                "employee_number": "REC001",
                "contact_number": "+27123456790",
                "company": "RoppaCorp Industries",
                "is_priority": False
            },
            {
                "full_name": "Michael Facilities Manager",
                "email": "manager@smartpark.com",
                "password": "password123",
                "role": "manager",
                "employee_number": "MGR001",
                "contact_number": "+27123456791",
                "company": "RoppaCorp Industries",
                "is_priority": True
            },
            {
                "full_name": "IT Admin",
                "email": "admin@smartpark.com",
                "password": "password123",
                "role": "admin",
                "employee_number": "ADM001",
                "contact_number": "+27123456792",
                "company": "RoppaCorp Industries",
                "is_priority": True
            }
        ]
        
        created_users = {}
        for user_data in users_data:
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing_user:
                user = User(
                    full_name=user_data["full_name"],
                    email=user_data["email"],
                    password_hash=get_password_hash(user_data["password"]),
                    role_id=roles[user_data["role"]].id,
                    employee_number=user_data["employee_number"],
                    contact_number=user_data["contact_number"],
                    company=user_data["company"],
                    is_priority=user_data["is_priority"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                created_users[user_data["role"]] = user
            else:
                created_users[user_data["role"]] = existing_user
        
        for i in range(5):
            existing_emp = db.query(User).filter(User.email == f"employee{i+2}@smartpark.com").first()
            if not existing_emp:
                emp = User(
                    full_name=f"Employee {i+2}",
                    email=f"employee{i+2}@smartpark.com",
                    password_hash=get_password_hash("password123"),
                    role_id=roles["employee"].id,
                    employee_number=f"EMP{str(i+2).zfill(3)}",
                    contact_number=f"+2712345{str(6793+i)}",
                    company="RoppaCorp Industries",
                    is_priority=False
                )
                db.add(emp)
        db.commit()
        
        print("Seeding sites...")
        sites_data = [
            {"name": "Site A", "total_spaces": 127},
            {"name": "Site B", "total_spaces": 103},
            {"name": "Site C", "total_spaces": 48}
        ]
        
        sites = {}
        for site_data in sites_data:
            existing_site = db.query(Site).filter(Site.name == site_data["name"]).first()
            if not existing_site:
                site = Site(**site_data)
                db.add(site)
                db.commit()
                db.refresh(site)
                sites[site_data["name"]] = site
            else:
                sites[site_data["name"]] = existing_site
        
        print("Seeding parking spaces...")
        space_configs = {
            "Site A": {"ev": 21, "disabled": 16, "visitor": 12, "total": 127},
            "Site B": {"ev": 14, "disabled": 10, "visitor": 8, "total": 103},
            "Site C": {"ev": 12, "disabled": 8, "visitor": 8, "total": 48}
        }
        
        for site_name, config in space_configs.items():
            site = sites[site_name]
            site_code = site_name.split()[1]
            
            existing_count = db.query(ParkingSpace).filter(ParkingSpace.site_id == site.id).count()
            if existing_count > 0:
                continue
            
            counter = 1
            
            for i in range(config["ev"]):
                space = ParkingSpace(
                    site_id=site.id,
                    bay_code=f"{site_code}-EV-{str(counter).zfill(3)}",
                    category="ev",
                    status="available",
                    pos_x=50 + (i % 10) * 80,
                    pos_y=50 + (i // 10) * 60
                )
                db.add(space)
                counter += 1
            
            for i in range(config["disabled"]):
                space = ParkingSpace(
                    site_id=site.id,
                    bay_code=f"{site_code}-DIS-{str(counter).zfill(3)}",
                    category="disabled",
                    status="available",
                    pos_x=50 + (i % 10) * 80,
                    pos_y=200 + (i // 10) * 60
                )
                db.add(space)
                counter += 1
            
            for i in range(config["visitor"]):
                space = ParkingSpace(
                    site_id=site.id,
                    bay_code=f"{site_code}-VIS-{str(counter).zfill(3)}",
                    category="visitor",
                    status="available",
                    pos_x=50 + (i % 10) * 80,
                    pos_y=350 + (i // 10) * 60
                )
                db.add(space)
                counter += 1
            
            standard_count = config["total"] - config["ev"] - config["disabled"] - config["visitor"]
            for i in range(standard_count):
                space = ParkingSpace(
                    site_id=site.id,
                    bay_code=f"{site_code}-STD-{str(counter).zfill(3)}",
                    category="standard",
                    status="available",
                    pos_x=50 + (i % 10) * 80,
                    pos_y=500 + (i // 10) * 60
                )
                db.add(space)
                counter += 1
        
        db.commit()
        
        print("Seeding bookings...")
        all_spaces = db.query(ParkingSpace).all()
        
        # Sample customer names for demo bookings
        customer_names = [
            "John Smith", "Mary Johnson", "David Williams", "Sarah Brown",
            "Michael Davis", "Emma Wilson", "James Taylor", "Lisa Anderson"
        ]
        companies = ["ABC Corp", "XYZ Ltd", "Tech Solutions", "Global Industries"]
        
        existing_bookings = db.query(Booking).count()
        if existing_bookings == 0:
            for i in range(15):
                space = random.choice(all_spaces)
                booking_date = date.today() + timedelta(days=random.randint(0, 7))
                customer = random.choice(customer_names)
                
                booking = Booking(
                    customer_name=customer,
                    customer_email=f"{customer.lower().replace(' ', '.')}@example.com",
                    customer_phone=f"+2712345{random.randint(1000, 9999)}",
                    customer_company=random.choice(companies),
                    site_id=space.site_id,
                    space_id=space.id,
                    booking_date=booking_date,
                    start_time=time(8, 0),
                    end_time=time(17, 0),
                    status=random.choice(["active", "active", "active", "completed", "pending"]),
                    booking_type="standard",
                    created_by=created_users["receptionist"].id
                )
                db.add(booking)
        
        db.commit()
        
        print("Seeding maintenance blocks...")
        existing_maintenance = db.query(MaintenanceBlock).count()
        if existing_maintenance == 0:
            for i in range(3):
                space = random.choice(all_spaces)
                maintenance = MaintenanceBlock(
                    site_id=space.site_id,
                    space_id=space.id,
                    reason=random.choice(["Pothole repair", "Line repainting", "Lighting maintenance"]),
                    start_datetime=datetime.now() + timedelta(days=random.randint(1, 5)),
                    end_datetime=datetime.now() + timedelta(days=random.randint(6, 10)),
                    created_by=created_users["manager"].id
                )
                db.add(maintenance)
                
                space.status = "maintenance"
        
        db.commit()
        
        print("Seeding guidance nodes and edges...")
        for site_name, site in sites.items():
            existing_nodes = db.query(GuidanceNode).filter(GuidanceNode.site_id == site.id).count()
            if existing_nodes > 0:
                continue
            
            entrance = GuidanceNode(
                site_id=site.id,
                node_code="ENTRANCE",
                node_type="entrance",
                pos_x=20,
                pos_y=300
            )
            db.add(entrance)
            db.commit()
            db.refresh(entrance)
            
            junction1 = GuidanceNode(
                site_id=site.id,
                node_code="JUNCTION_1",
                node_type="junction",
                pos_x=200,
                pos_y=300
            )
            db.add(junction1)
            db.commit()
            db.refresh(junction1)
            
            junction2 = GuidanceNode(
                site_id=site.id,
                node_code="JUNCTION_2",
                node_type="junction",
                pos_x=400,
                pos_y=300
            )
            db.add(junction2)
            db.commit()
            db.refresh(junction2)
            
            parking1 = GuidanceNode(
                site_id=site.id,
                node_code="PARKING_ZONE_1",
                node_type="parking",
                pos_x=200,
                pos_y=100
            )
            db.add(parking1)
            db.commit()
            db.refresh(parking1)
            
            parking2 = GuidanceNode(
                site_id=site.id,
                node_code="PARKING_ZONE_2",
                node_type="parking",
                pos_x=400,
                pos_y=500
            )
            db.add(parking2)
            db.commit()
            db.refresh(parking2)
            
            edges_data = [
                (entrance.id, junction1.id, 10.0),
                (junction1.id, junction2.id, 15.0),
                (junction1.id, parking1.id, 12.0),
                (junction2.id, parking2.id, 12.0)
            ]
            
            for from_id, to_id, dist in edges_data:
                edge = GuidanceEdge(
                    site_id=site.id,
                    from_node_id=from_id,
                    to_node_id=to_id,
                    distance=dist
                )
                db.add(edge)
        
        db.commit()
        
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
