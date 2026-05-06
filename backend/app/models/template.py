from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class TemplateStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class TemplateCategory(str, Enum):
    WEB = "web"
    MOBILE = "mobile"
    DESKTOP = "desktop"
    API = "api"
    AI_ML = "ai_ml"
    DATA_SCIENCE = "data_science"
    DEVOPS = "devops"
    OTHER = "other"


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    tags = Column(JSON, nullable=True)
    price = Column(Float, nullable=False, default=0.0)
    preview_url = Column(String(500), nullable=True)
    file_url = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(50), nullable=True)
    version = Column(String(50), nullable=True, default="1.0.0")
    status = Column(String(50), nullable=False, default=TemplateStatus.DRAFT.value, index=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    download_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    rating_average = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_templates")
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    reviews = relationship("TemplateReview", back_populates="template", cascade="all, delete-orphan")
    purchases = relationship("TemplatePurchase", back_populates="template", cascade="all, delete-orphan")
    saved_by = relationship("TemplateSaved", back_populates="template", cascade="all, delete-orphan")


class TemplateReview(Base):
    __tablename__ = "template_reviews"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    is_verified_purchase = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    template = relationship("Template", back_populates="reviews")
    user = relationship("User", foreign_keys=[user_id], back_populates="reviews")


class TemplatePurchase(Base):
    __tablename__ = "template_purchases"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False, default=0.0)
    creator_earning = Column(Float, nullable=False, default=0.0)
    payment_status = Column(String(50), nullable=False, default="pending")
    payment_method = Column(String(50), nullable=True)
    transaction_id = Column(String(255), nullable=True)
    purchased_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    download_at = Column(DateTime, nullable=True)

    template = relationship("Template", back_populates="purchases")
    user = relationship("User", foreign_keys=[user_id], back_populates="purchases")


class TemplateSaved(Base):
    __tablename__ = "template_saved"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    saved_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    template = relationship("Template", back_populates="saved_by")
    user = relationship("User", foreign_keys=[user_id], back_populates="saved_templates")


class CreatorEarning(Base):
    __tablename__ = "creator_earnings"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("templates.id"), nullable=True)
    purchase_id = Column(Integer, ForeignKey("template_purchases.id"), nullable=True)
    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="pending")
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User", foreign_keys=[creator_id], back_populates="earnings")
    template = relationship("Template", foreign_keys=[template_id])
    purchase = relationship("TemplatePurchase", foreign_keys=[purchase_id])