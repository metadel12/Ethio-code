from pydantic import BaseModel


class VideoRoomCreate(BaseModel):
    name: str
