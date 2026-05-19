from pydantic import BaseModel


class PaymentCreate(BaseModel):
    plan: str
