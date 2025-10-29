
from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.mysql import DiscountCard
from app.schemas.users_schemas import InfoUserLoyaltySystem


async def get_user_loyalty_by_id(card_num: str, db: AsyncSession) -> InfoUserLoyaltySystem:
    # try:
        stmt_user = select(
            DiscountCard.id,
            DiscountCard.base_id,
            DiscountCard.mag_id,
            DiscountCard.active,
            DiscountCard.status,
            DiscountCard.user_id,
            DiscountCard.card_num,
            DiscountCard.card_old_num,
            DiscountCard.discount_id,
            DiscountCard.phone,
            DiscountCard.send_check,
            DiscountCard.phone_pass,
            DiscountCard.phone_verify,
            DiscountCard.first,
            DiscountCard.second,
            DiscountCard.third,
            DiscountCard.boss,
            DiscountCard.bday,
            DiscountCard.gender,
            DiscountCard.email,
            DiscountCard.photo,
            DiscountCard.adress,
            DiscountCard.avg_check,
            DiscountCard.koef,
            DiscountCard.telegram,
            DiscountCard.send_telegram,
            DiscountCard.chat_id,
            DiscountCard.mode,
            DiscountCard.date_added,
        ).where(DiscountCard.card_num == card_num)

        result_user = await db.execute(stmt_user)
        user_row = result_user.mappings().first()

        if not user_row:
            raise HTTPException(status_code=404, detail="Discount Card not found")

        return InfoUserLoyaltySystem(**user_row)


    # except HTTPException as http_exc:
    #     raise http_exc
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))