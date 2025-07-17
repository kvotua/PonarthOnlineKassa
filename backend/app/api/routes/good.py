from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.models.mysql import Good
from app.schemas.good_schemas import InfoGoods
from app.databases.mysql_db import get_mysql_session
router = APIRouter(prefix='/goods', tags=["goods"])



@router.get("/", response_model=List[InfoGoods])
async def get_goods_list(
    session: AsyncSession = Depends(get_mysql_session),
    limit: int = 100,
    offset: int = 0
):
    """
    Получить список товаров
    - **limit**: максимальное количество товаров (по умолчанию 100)
    - **offset**: смещение для пагинации (по умолчанию 0)
    """
    result = await session.execute(
        select(Good.id, Good.name, Good.name_kassa)
        .where(Good.status == 0)  # только активные товары (не удаленные)
        .limit(limit)
        .offset(offset)
    )
    goods = result.all()
    return [InfoGoods(id=str(item.id), name=item.name, name_kassa=item.name_kassa) for item in goods]

@router.get("/{good_id}", response_model=InfoGoods)
async def get_good_by_id(
    good_id: int,
    session: AsyncSession = Depends(get_mysql_session)
):
    """
    Получить товар по ID
    - **good_id**: ID товара
    """
    result = await session.execute(
        select(Good.id, Good.name, Good.name_kassa)
        .where(Good.id == good_id)
        .where(Good.status == 0)
    )
    good = result.first()
    if not good:
        raise HTTPException(status_code=404, detail="Good not found")
    return InfoGoods(id=str(good.id), name=good.name, name_kassa=good.name_kassa)