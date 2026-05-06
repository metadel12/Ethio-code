from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class RatingDistribution(BaseModel):
    five: int = Field(0, alias="5")
    four: int = Field(0, alias="4")
    three: int = Field(0, alias="3")
    two: int = Field(0, alias="2")
    one: int = Field(0, alias="1")

    class Config:
        populate_by_name = True

class Template(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    slug: str
    description: str
    category: str
    subcategory: Optional[str] = None
    tags: List[str] = []
    price: float = 0
    discount_price: Optional[float] = None
    currency: str = "ETB"
    file_url: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    documentation_url: Optional[str] = None
    preview_images: List[str] = []
    preview_video: Optional[str] = None
    version: str = "1.0.0"
    file_size: Optional[int] = None
    downloads: int = 0
    views: int = 0
    rating_average: float = 0
    rating_count: int = 0
    rating_distribution: RatingDistribution = RatingDistribution()
    requirements: List[str] = []
    installation_steps: List[str] = []
    features: List[str] = []
    license: str = "MIT"
    is_premium: bool = False
    is_featured: bool = False
    is_verified: bool = False
    creator_id: PyObjectId
    status: str = "draft"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TemplatePurchase(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    template_id: PyObjectId
    amount: float
    currency: str = "ETB"
    payment_method: str
    transaction_id: str
    license_key: Optional[str] = None
    download_count: int = 0
    download_dates: List[datetime] = []
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class CreatorResponse(BaseModel):
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TemplateReview(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: PyObjectId
    template_id: PyObjectId
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: str
    pros: List[str] = []
    cons: List[str] = []
    verified_purchase: bool = False
    helpful_count: int = 0
    reported: bool = False
    creator_response: Optional[CreatorResponse] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
