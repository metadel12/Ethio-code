from sqlalchemy import Column, Integer, String

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, nullable=False, default="pending")
