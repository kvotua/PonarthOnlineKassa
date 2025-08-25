

from select import select

from app.databases.mysql_db import get_mysql_session
from app.models.mysql import Section

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.schemas.section_schemas import SectionModel

router = APIRouter()

from sqlalchemy import not_


@router.get("/sections", response_model=List[SectionModel])
async def get_all_sections(
        db: AsyncSession = Depends(get_mysql_session),
):
    excluded_names = ["Хоз.нужды и расходники", "Тара для прайса!!!", "ТАРА ДЛЯ ПРАЙСА"]

    stmt = select(Section).where(not_(Section.name.in_(excluded_names)))
    result = await db.execute(stmt)
    sections = result.scalars().all()
    return sections