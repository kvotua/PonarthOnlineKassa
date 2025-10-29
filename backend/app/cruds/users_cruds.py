
from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.mysql import Achievements, DiscountAchievements, DiscountCard
from app.schemas.users_schemas import InfoUserLoyaltySystem, UserInfo


async def get_user_loyalty_by_id(card_num: str, db: AsyncSession) -> UserInfo:
    stmt_user = select(
        DiscountCard.id,
        DiscountCard.card_num,
        DiscountCard.phone,
        DiscountCard.first,
        DiscountCard.second,
        DiscountCard.third,
        DiscountCard.bday,
        DiscountCard.gender,
        DiscountCard.email,
        DiscountCard.telegram,
        DiscountCard.send_telegram,
        DiscountCard.chat_id,
        DiscountCard.date_added,
    ).where(DiscountCard.card_num == card_num)

    result_user = await db.execute(stmt_user)
    user_row = result_user.mappings().first()

    if not user_row:
        raise HTTPException(status_code=404, detail="Discount Card not found")

    discount_card_id = user_row["id"]

    stmt_achievements = (
        select(
            Achievements.name,
            Achievements.description
        )
        .join(DiscountAchievements, DiscountAchievements.achievement_id == Achievements.id)
        .where(DiscountAchievements.discount_card_id == discount_card_id)
    )

    result_achievements = await db.execute(stmt_achievements)
    achievements_list = [
        {"name": row.name, "description": row.description}
        for row in result_achievements
    ]

    return UserInfo(
        **user_row,
        achievements=achievements_list
    )


    # except HTTPException as http_exc:
    #     raise http_exc
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))