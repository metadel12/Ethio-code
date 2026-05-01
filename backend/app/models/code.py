from sqlalchemy import Column, Integer, String, Text

from app.database import Base


class CodeSubmission(Base):
    __tablename__ = "code_submissions"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(String, nullable=False)
    source = Column(Text, nullable=False)
