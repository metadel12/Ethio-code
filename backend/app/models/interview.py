from sqlalchemy import Column, Integer, String

from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
