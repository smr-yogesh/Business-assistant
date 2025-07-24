from app import app
from utils.extensions import db
from model.user import User
from datetime import datetime


def init_database():
    """Initialize the database with tables"""
    with app.app_context():
        # Drop all tables (use with caution in production)
        db.drop_all()

        # Create all tables
        db.create_all()

        print("Database tables created successfully!")


if __name__ == "__main__":
    init_database()
