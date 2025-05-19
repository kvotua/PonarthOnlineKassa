from pydantic import BaseModel, Field
from typing import Annotated


class ContentOfCart(BaseModel):
    content: Annotated[list[dict], Field(title="Content of cart", examples=[[{
        "product_id": "Something ID",
        "product_name": "Светлое",
        "description": "Классический фильтрованный лагер обладает великолепным вкусом и ароматом.",
        "cost": 75
    }]])]


class AddToCart(BaseModel):
    product_id: Annotated[str, Field(title="List of products", examples=["Something ID'1"])]
    volume: Annotated[float, Field(title="Volume", examples=[1,5])]