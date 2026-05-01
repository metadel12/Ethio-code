from sqlalchemy import Column, Integer, String

from app.database import Base


class ProctoringFlag(Base):
    __tablename__ = "proctoring_flags"

    id = Column(Integer, primary_key=True, index=True)
    reason = Column(String, nullable=False)
