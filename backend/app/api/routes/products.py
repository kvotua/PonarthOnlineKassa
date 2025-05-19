from fastapi import APIRouter, Path
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.products_schemas import InfoProducts
from app.databases.postgresdb import get_postgres_session


router = APIRouter(prefix="/products", tags=["Products"])


@router.get('/', response_model=list[InfoProducts])
async def get_products(

):
    pass

@router.get('/{productID}', response_model=InfoProducts)
async def get_product(

    productID: Annotated[str, Path(title="Product ID", examples=["Something ID"])]
):
    pass