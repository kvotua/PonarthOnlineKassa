from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.mysql import Verification, DiscountCard, UserScore
from app.config import base_id, firm_id, discount_id


async def add_verify_session(call_id: str, code: str, phone: str, session_mysql: AsyncSession) -> Verification:
    try:
        data = Verification(call_id=call_id, code=code, phone=phone)
        session_mysql.add(data)
        await session_mysql.commit()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_verify_session(call_id: str, code: str, session_mysql: AsyncSession) -> Verification:
    try:
        stmt = select(Verification).where(
            Verification.call_id == call_id,
            Verification.code == code)
        result: Result = await session_mysql.execute(stmt)
        verif_session = result.scalar_one_or_none()
        if not verif_session:
            raise HTTPException(status_code=401, detail="Invalid ID or code")

        return verif_session
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_verify_session_without_code(call_id: str, phone: str, session_mysql: AsyncSession) -> Verification:
    try:
        stmt = select(Verification).where(
            Verification.call_id == call_id,
            Verification.phone == phone)
        result: Result = await session_mysql.execute(stmt)
        verif_session = result.scalar_one_or_none()
        if not verif_session:
            raise HTTPException(status_code=401, detail="Invalid ID or code")

        return verif_session
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def change_verify_status(call_id: str, code: str, session_mysql: AsyncSession):
    try:
        stmt = select(Verification).where(
            Verification.call_id == call_id,
            Verification.code == code)
        result: Result = await session_mysql.execute(stmt)
        verif_session = result.scalar_one_or_none()
        if not verif_session:
            raise HTTPException(status_code=401, detail="Invalid ID or code")
        verif_session.verified = True
        await session_mysql.commit()
        await session_mysql.refresh(verif_session)
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def check_phone_in_discound(phone: str, session_mysql: AsyncSession) -> bool:
    stmt = select(DiscountCard).where(DiscountCard.phone ==
                                      phone[1:], DiscountCard.base_id == base_id, DiscountCard.mag_id == firm_id, DiscountCard.discount_id == discount_id)
    print(stmt)
    result: Result = await session_mysql.execute(stmt)
    check = result.scalars().first()

    if not check:
        print(
            f"Карта не найдена для phone={phone[1:]}, base_id={base_id}, firm_id={firm_id}")
        return False
    print(f"Найдена карта: ID={check.id}")
    stmt_score = select(
        UserScore.scores).where(
        UserScore.card_id == check.id,
        UserScore.status == 1)
    result_score: Result = await session_mysql.execute(stmt_score)
    scores = result_score.scalars().all()
    print(f"Найдено баллов: {len(scores)}")
    return scores if scores else 0
