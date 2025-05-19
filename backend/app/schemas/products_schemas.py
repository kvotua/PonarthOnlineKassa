from pydantic import BaseModel, Field
from typing import Annotated


class InfoProducts(BaseModel):
    product_id: Annotated[str, Field(title="Product ID", examples=["Something ID"])]
    product_name: Annotated[str, Field(title="Product name", examples=["Светлое"])]
    description: Annotated[str, Field(title="Description product", examples=["Классический фильтрованный лагер обладает великолепным вкусом и ароматом."])]
    cost: Annotated[int, Field(title="Product price for 0,5", examples=[75])]