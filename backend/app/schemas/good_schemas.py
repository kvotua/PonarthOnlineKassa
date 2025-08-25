from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field
from typing import Annotated, Optional


class GoodPriceResponse(BaseModel):
    id: int
    name: str
    name_kassa: str
    price_real: float
    section_name: str
    class Config:
        from_attributes = True
