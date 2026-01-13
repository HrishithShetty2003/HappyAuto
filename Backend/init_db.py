import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, create_tables
from app.models.user import User
from app.models.driver import Driver
from app.models.customer import Customer

def initialize_database():
    print("🚀 Initializing HappyAuto Database...")
    
    # Create all tables
    create_tables()
    
    print("✅ Database initialized successfully!")
    print(f"Database URL: {engine.url}")

if __name__ == "__main__":
    initialize_database()