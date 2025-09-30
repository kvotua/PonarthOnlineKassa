from http.client import HTTPException
from operator import and_

from app.databases.mysql_db import get_mysql_session
from app.models.mysql import Good, GoodPrice, Section
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
            Section.name.label("section_name")
        )
        .join(GoodPrice, Good.id == GoodPrice.good_id)
        .join(Section, Good.sect_id == Section.id)  # Связь через sect_id
        .where(
            and_(
                GoodPrice.status == 1,
                Good.name_kassa == "Товар"
            )
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

@router.get("/goods/search/{search_name}", response_model=List[GoodPriceResponse])
async def get_good_search_by_name(
    search_name: str,
        db: AsyncSession = Depends(get_mysql_session)
):
    stmt = (
        select(
            Good.id,
            Good.name,
            Good.name_kassa,
            GoodPrice.price_real,
            Section.name.label("section_name")
        )
        .join(GoodPrice, Good.id == GoodPrice.good_id)
        .join(Section, Good.sect_id == Section.id)
        .where(
            and_(
                GoodPrice.status == 1,
                Good.name.ilike(f"%{search_name}%"), # Поиск с учетом регистра
            )
        )
    )
    result = await db.execute(stmt)
    results = result.all()

    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"Goods with name containing '{search_name}' not found"
        )

    return [GoodPriceResponse(
        id=row.id,
        name=row.name,
        name_kassa=row.name_kassa,
        price_real=row.price_real,
        section_name=row.section_name
    ) for row in results]