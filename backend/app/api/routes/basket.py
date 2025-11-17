from http.client import HTTPException
from operator import and_

from app.databases.mysql_db import get_mysql_session
from app.models.mysql import Good, GoodPrice, Sections, Basket, DiscountCard, Orders
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List
from app.cruds import basket_cruds

from app.config import base_id, firm_id

from app.schemas.good_schemas import GoodPriceResponse
from app.utils import get_current_user_from_cookie

router = APIRouter(prefix="/basket", tags=['basket'])

@router.get("/all", response_model=Any)
async def get_all_baskets(
    count: int = Query(10, title="Items count", examples=[10, 15, 25]),
    page: int = Query(1, title="Page", examples=[1, 2, 3, 4, 5]),
    user_data=Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_mysql_session)
):
    phone = user_data['phone']
    info = await basket_cruds.get_all_baskets_by_card(db=db, card_num=phone, count=count, page=page)
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
        Sections.name.label("section_name")

    ).join(
        GoodPrice, Good.id == GoodPrice.good_id
    ).where(
        and_(
            GoodPrice.status == 1,
            Good.id == good_id, Good.base_id == base_id, Good.firm_id == firm_id
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