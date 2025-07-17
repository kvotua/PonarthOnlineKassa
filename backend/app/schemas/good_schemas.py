from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field
from typing import Annotated, Optional

class InfoGoods(BaseModel):
    id: Annotated[str, Field(title="Product ID", examples=["Something ID"])]
    name: Annotated[str, Field(title="Product name", examples=["Светлое"])]
    name_kassa: Annotated[str, Field(title="Description product", examples=["Товар."])]
