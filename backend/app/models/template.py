from sqlalchemy import Column, Integer, String, Text

from app.database import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    content = Column(Text, nullable=True)
