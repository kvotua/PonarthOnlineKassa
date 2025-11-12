
from datetime import datetime, date, timedelta, timezone, time
from sqlalchemy import and_, func, or_, select, Result, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects import mysql
from fastapi import HTTPException

from app.models.mysql import DiscountCard, Gift, GiftStatus, Orders, UserScore
from app.schemas.users_schemas import ChangeUser, ReferalInfo, UserInfo
from app.schemas.users_schemas import Gift as GiftSchema
from app.cruds.verify_cruds import check_phone_in_discound
from app.utils import convert_decimal_to_float

from app.config import base_id, firm_id

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

async def transfer_scores(transfer_from: int, transfer_to: int, scores: int, db: AsyncSession) -> bool | None:
    try:
        sender_entry = UserScore(
            date_added=datetime.now(),
            status=1,
            base_id=base_id,
            order_id=0,
            card_id=transfer_from,
            scores=-abs(scores),
            transfer_from=transfer_from,
            transfer_to=transfer_to
        )

        receiver_entry = UserScore(
            date_added=datetime.now(),
            status=1,
            base_id=base_id,
            order_id=0,
            card_id=transfer_to,
            scores=abs(scores),
            transfer_from=transfer_from,
            transfer_to=transfer_to
        )

        db.add_all([sender_entry, receiver_entry])
        await db.commit()

        return True

    except Exception as e:
        await db.rollback()
        print(f"Error in transfer_scores: {e}")
        return None

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
        current_month_start = datetime.combine(today.replace(day=1), time.min)

        last_month_end_date = current_month_start.date() - timedelta(days=1)
        last_month_end = datetime.combine(last_month_end_date, time.max)

        last_month_start = datetime.combine(last_month_end.replace(day=1).date(), time.min)

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

        last_month_query = base_query.where(
            Orders.date_closed >= last_month_start,
            Orders.date_closed <= last_month_end
        )

        # print(last_month_query.compile(
        #     dialect=mysql.dialect(),
        #     compile_kwargs={"literal_binds": True}
        # ))

        result = await db.execute(last_month_query)
        last_month = result.scalar() or 0

        current_month_query = base_query.where(
            Orders.date_closed >= current_month_start,
            Orders.date_closed <= today
        )

        result = await db.execute(current_month_query)
        current_month = result.scalar() or 0

    return ReferalInfo(
        referals=referals,
        last_month=float(last_month),
        current_month=float(current_month),
        total=float(total)
    )

async def get_user_scores_by_id(discount_card_id: int, db: AsyncSession) -> int | None:
    stmt = select(DiscountCard).where(
        DiscountCard.id == discount_card_id, 
        DiscountCard.base_id == base_id, 
        DiscountCard.mag_id == firm_id
    )
    result: Result = await db.execute(stmt)
    check = result.scalars().first()

    if not check:
        return None
    stmt_score = select(
        UserScore.scores).where(
        UserScore.card_id == check.id, UserScore.base_id == base_id,
        UserScore.status == 1)
    result_score: Result = await db.execute(stmt_score)
    response = result_score.scalars().all()
    scores = convert_decimal_to_float(response)
    if isinstance(scores, (int, float)):
        scores = [scores]
    total_score = sum(scores) if scores else 0
    return total_score

async def get_transfers(card_num: str, db: AsyncSession):
    # Получаем ID карты по номеру
    discount_card_id = await get_user_discount_id_by_card(card_num=card_num, db=db)
    if not discount_card_id:
        return []

    # Получаем только переводы, где карта действительно участвовала и card_id совпадает
    query = (
        select(UserScore)
        .where(
            or_(
                and_(
                    UserScore.transfer_from == discount_card_id,
                    UserScore.card_id == discount_card_id
                ),
                and_(
                    UserScore.transfer_to == discount_card_id,
                    UserScore.card_id == discount_card_id
                )
            )
        )
        .order_by(UserScore.date_added.desc())
    )
    result = await db.execute(query)
    transfers = result.scalars().all()

    transfer_history = []

    for t in transfers:
        # Если карта отправитель → минус и имя получателя
        if t.transfer_from == discount_card_id:
            amount = float(t.scores)
            target_id = t.transfer_to
        # Если карта получатель → плюс и имя отправителя
        else:
            amount = float(t.scores)
            target_id = t.transfer_from

        # Получаем имя второй стороны перевода
        card_query = select(DiscountCard).where(DiscountCard.id == target_id)
        card_result = await db.execute(card_query)
        card_owner = card_result.scalar_one_or_none()

        name = None
        if card_owner:
            first_name = getattr(card_owner, "first", "")
            last_name = getattr(card_owner, "second", "")
            name = f"{first_name} {last_name}".strip() or "Unknown"

        transfer_history.append({
            "id": t.id,
            "name": name,
            "date": t.date_added.strftime("%Y-%m-%d") if t.date_added else None,
            "amount": amount,
            "type": "Перевод",
            "receiptNumber": None
        })

    return transfer_history

async def get_user_by_card_num(card_num: str, db: AsyncSession):
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
    
    return user_row

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