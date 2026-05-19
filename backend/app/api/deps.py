from app.database import db


async def get_db():
    """Get MongoDB database instance"""
    return db
