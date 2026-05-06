from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="job_seeker")
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String(50), nullable=True)
    avatar = Column(String(500), nullable=True)
    skills = Column(Text, nullable=True)
    resume_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)

    company_name = Column(String(255), nullable=True)
    company_registration = Column(String(255), nullable=True)
    company_website = Column(String(500), nullable=True)
    company_description = Column(Text, nullable=True)
    company_size = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    created_templates = relationship("Template", foreign_keys="Template.creator_id", back_populates="creator")
    reviews = relationship("TemplateReview", foreign_keys="TemplateReview.user_id", back_populates="user")
    purchases = relationship("TemplatePurchase", foreign_keys="TemplatePurchase.user_id", back_populates="user")
    saved_templates = relationship("TemplateSaved", foreign_keys="TemplateSaved.user_id", back_populates="user")
    earnings = relationship("CreatorEarning", foreign_keys="CreatorEarning.creator_id", back_populates="creator")