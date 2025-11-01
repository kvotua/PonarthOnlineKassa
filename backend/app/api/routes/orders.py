from http.client import HTTPException
from operator import and_

from app.databases.mysql_db import get_mysql_session
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List
from app.cruds import basket_cruds

router = APIRouter(prefix="/orders", tags=['orders'])

@router.get("/bill", response_model=Any)
async def get_bill_by_order_id(
    order_id: int,
    db: AsyncSession = Depends(get_mysql_session),
):
    info = await basket_cruds.get_order_by_id(db=db, order_id=order_id)
    return info
