from http.client import HTTPException
from operator import and_

from app.databases.mysql_db import get_mysql_session
from app.models.mysql import Good, GoodPrice, Sections
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.schemas.good_schemas import GoodPriceResponse


router = APIRouter()

@router.get("/goods-with-prices", response_model=List[GoodPriceResponse])
async def get_goods_with_prices(db: AsyncSession = Depends(get_mysql_session)):
    stmt = (
        select(
            Good.id,
            Good.name,
            Good.name_kassa,
            GoodPrice.price_real,
            Sections.name.label("section_name")
        )
        .select_from(Good)  # Явно указываем основную таблицу
        .join(GoodPrice, Good.id == GoodPrice.good_id)  # Явное условие JOIN
        .join(Sections, Good.sect_id == Sections.id)  # Явное условие JOIN
        .where(
            GoodPrice.status == 1
        )
    )

    result = await db.execute(stmt)
    results = result.all()

    return [GoodPriceResponse(
        id=row.id,
        name=row.name,
        name_kassa=row.name_kassa,
        price_real=row.price_real,
        section_name=row.section_name
    ) for row in results]

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