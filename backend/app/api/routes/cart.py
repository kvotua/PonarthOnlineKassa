from fastapi import APIRouter
from sqlalchemy.ext.asyncio import AsyncSession


from app.schemas.cart_schemas import ContentOfCart, AddToCart
from app.schemas.response_schemas import ResponseSchema
from app.databases.postgresdb import get_postgres_session


router = APIRouter(prefix='/cart', tags=["Cart"])


@router.get('/', response_model=ContentOfCart)
async def get_content_of_cart(
):
    pass


@router.post('/add', response_model=ResponseSchema)
async def add_content_to_cart(
    data: list[AddToCart]
): 
    pass