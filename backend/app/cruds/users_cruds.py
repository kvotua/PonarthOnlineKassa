
from datetime import datetime, date, timedelta, timezone
from sqlalchemy import func, select, Result, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.mysql import DiscountCard, Gift, GiftStatus, Orders, UserScore
from app.schemas.users_schemas import ChangeUser, ReferalInfo, UserInfo
from app.schemas.users_schemas import Gift as GiftSchema
from app.cruds.verify_cruds import check_phone_in_discound
from app.utils import convert_decimal_to_float

from app.config import base_id

async def get_user_discount_id_by_card(card_num: str, db: AsyncSession) -> int | None:
    stmt_user = select(DiscountCard.id).where(DiscountCard.card_num == card_num)
    result_user = await db.execute(stmt_user)
    user_row = result_user.mappings().first()

    if user_row:
        return user_row['id']
    return None

async def get_gift_by_id(gift_id: int, db: AsyncSession) -> Gift | None:
    stmt = select(Gift).where(Gift.id == gift_id)
    result = await db.execute(stmt)
    gift_row = result.scalar_one_or_none()
    return gift_row

async def change_user(data: ChangeUser, db: AsyncSession) -> bool:
    try:
        stmt = (
            update(DiscountCard)
            .where(DiscountCard.card_num == data.card_num)
            .values(
                first=data.last_name,
                second=data.first_name,
                third=data.patronymic
            )
        )
        await db.execute(stmt)
        await db.commit()
        return True
    except Exception as e:
        await db.rollback()
        print("Ошибка при обновлении DiscountCard:", e)
        return False
    

async def save_telegram(db: AsyncSession, send_telegram: bool, card_num: str) -> bool:
    try:
        stmt = (
            update(DiscountCard)
            .where(DiscountCard.card_num == card_num)
            .values(
                send_telegram = send_telegram
            )
        )
        await db.execute(stmt)
        await db.commit()
        return True
    except Exception as e:
        await db.rollback()
        print("Ошибка при обновлении DiscountCard:", e)
        return False

async def activate_gift(gift_id: int, db: AsyncSession) -> None:
    stmt = (
        update(Gift)
        .where(Gift.id == gift_id)
        .values(
            status=GiftStatus.ACTIVATED,
            date_cancelled=datetime.now(timezone.utc)
        )
    )
    await db.execute(stmt)
    await db.commit()

async def get_referal_info(card_num: str, db: AsyncSession) -> ReferalInfo:
    # Получаем ID карты
    result = await db.execute(
        select(DiscountCard.id).where(DiscountCard.card_num == card_num)
    )
    card_id = result.scalar_one_or_none()

    referals = 0
    last_month = 0
    current_month = 0
    total = 0

    if card_id:
        result = await db.execute(
            select(func.count()).where(DiscountCard.referal_discount_card_id == card_id)
        )
        referals = result.scalar() or 0

        today = date.today()
        current_month_start = today.replace(day=1)
        last_month_end = current_month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        base_query = (
            select(func.coalesce(func.sum(UserScore.scores), 0))
            .join(Orders, Orders.id == UserScore.order_id)
            .where(
                UserScore.card_id == card_id,
                UserScore.base_id == base_id,
                Orders.card_id != card_id
            )
        )

        total = (await db.execute(base_query)).scalar() or 0

        result = await db.execute(
            base_query.where(
                Orders.date_closed >= last_month_start,
                Orders.date_closed <= last_month_end
            )
        )
        last_month = result.scalar() or 0

        result = await db.execute(
            base_query.where(
                Orders.date_closed >= current_month_start,
                Orders.date_closed <= today
            )
        )
        current_month = result.scalar() or 0

    return ReferalInfo(
        referals=referals,
        last_month=float(last_month),
        current_month=float(current_month),
        total=float(total)
    )

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

    discount_card_id = user_row['id']

    stmt_gifts = select(
        Gift.id,
        Gift.title,
        Gift.description,
        Gift.good_id,
        Gift.sect_id,
        Gift.discount_card_id,
        Gift.order_id,
        Gift.poll_id,
        Gift.quantity,
        Gift.status,
        Gift.origin,
        Gift.present_date,
        Gift.date_end,
        Gift.date_used,
        Gift.date_cancelled,
        Gift.score,
        Gift.cashback,
        Gift.date_added,
        Gift.emoji
    ).where(Gift.discount_card_id == discount_card_id)

    result_gifts = await db.execute(stmt_gifts)
    gifts_rows = result_gifts.mappings().all()

    gifts_list = [GiftSchema(**gift) for gift in gifts_rows]

    response = await check_phone_in_discound(phone=card_num, session_mysql=db)
    scores = convert_decimal_to_float(response)
    if isinstance(scores, (int, float)):
        scores = [scores]
    total_score = sum(scores) if scores else 0

    return UserInfo(
        **user_row,
        total_score=total_score,
        gifts=gifts_list
    )