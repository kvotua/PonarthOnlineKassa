
from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.mysql import DiscountCard
from app.schemas.users_schemas import InfoUserLoyaltySystem


async def get_user_loyalty_by_id(user_id: int, session_mysql: AsyncSession) -> InfoUserLoyaltySystem:
    try:
        stmt_user = select(DiscountCard).where(DiscountCard.user_id == user_id)
        result_user: Result = await session_mysql.execute(stmt_user)
        user = result_user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="Discount Cart not found")
        return InfoUserLoyaltySystem(
            id=user.id,
            base_id=user.base_id,
            mag_id=user.mag_id,
            active=user.active,
            status=user.status,
            user_id=user.user_id,
            card_num=user.card_num,
            card_old_num=user.card_old_num,
            discount_id=user.discount_id,
            phone=user.phone,
            send_check=user.send_check,
            phone_pass=user.phone_pass,
            phone_verify=user.phone_verify,
            first=user.first,
            second=user.second,
            third=user.third,
            boss=user.boss,
            bday=user.bday,
            gender=user.gender,
            email=user.email,
            photo=user.photo,
            adress=user.adress,
            avg_check=user.avg_check,
            koef=user.koef,
            telegram=user.telegram,
            send_telegram=user.send_telegram,
            chat_id=user.chat_id,
            mode=user.mode,
            date_added=user.date_added,
            data=user.data
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))