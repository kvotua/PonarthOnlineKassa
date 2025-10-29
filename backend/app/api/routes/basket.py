from http.client import HTTPException
from operator import and_

from app.databases.mysql_db import get_mysql_session
from app.models.mysql import Good, GoodPrice, Section, Basket, DiscountCard, Orders
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List
from app.cruds import basket_cruds

from app.schemas.good_schemas import GoodPriceResponse

router = APIRouter(prefix="/basket", tags=['basket'])

@router.get("/all", response_model=Any)
async def get_all_baskets(
    card_num: str,
    db: AsyncSession = Depends(get_mysql_session),
):
    info = await basket_cruds.get_all_baskets_by_card(db=db, card_num=card_num)
    return info
    

@router.get("/goods-with-prices/{good_id}", response_model=GoodPriceResponse)
async def get_good_with_price_by_id(
    good_id: int,
    db: AsyncSession = Depends(get_mysql_session)
):
    stmt = select(
        Good.id,
        Good.name,
        Good.name_kassa,
        GoodPrice.price_real,
        Section.name.label("section_name")

    ).join(
        GoodPrice, Good.id == GoodPrice.good_id
    ).where(
        and_(
            GoodPrice.status == 1,
            Good.id == good_id
        )
    )

    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"Good with ID {good_id} not found or has no active prices"
        )

    return GoodPriceResponse(
        id=row.id,
        name=row.name,
        name_kassa=row.name_kassa,
        price_real=row.price_real,
        section_name=row.section_name

    )