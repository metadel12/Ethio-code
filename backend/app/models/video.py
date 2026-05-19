from sqlalchemy import Column, Integer, String

from app.database import Base


class VideoRoom(Base):
    __tablename__ = "video_rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
