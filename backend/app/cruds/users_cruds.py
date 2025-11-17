
from datetime import datetime, date, timedelta, timezone, time
import json
import math
from sqlalchemy import and_, case, desc, func, or_, select, Result, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects import mysql
from sqlalchemy.orm import selectinload, aliased
from fastapi import HTTPException

from app.models.mysql import DiscountCard, Firm, Gift, GiftStatus, Orders, UserScore
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

async def get_user_telegram(card_num: str, db: AsyncSession) -> int | None:
    stmt_user = select(DiscountCard.chat_id).where(DiscountCard.card_num == card_num)
    result_user = await db.execute(stmt_user)
    user_row = result_user.mappings().first()

    if user_row:
        return user_row['chat_id']
    return None

async def get_gift_by_id(gift_id: int, db: AsyncSession) -> Gift | None:
    stmt = select(Gift).where(Gift.id == gift_id)
    result = await db.execute(stmt)
    gift_row = result.scalar_one_or_none()
    return gift_row

async def change_user(card_num: str, data: ChangeUser, db: AsyncSession) -> bool:
    try:
        query = select(
            DiscountCard.id,
            DiscountCard.first,
            DiscountCard.second,
            DiscountCard.third,
            DiscountCard.data
        ).where(DiscountCard.card_num == card_num)

        result = await db.execute(query)
        row = result.first()

        print('row:', row)

        if not row:
            return False

        card_id, first, second, third, data_str = row

        update_values = {
            "first": data.first_name,
            "second": data.last_name,
            "third": data.patronymic,
        }

        if data_str:
            try:
                data_json = json.loads(data_str)
                if isinstance(data_json, dict) and "first" in data_json:
                    data_json["first"] = data.first_name
                    data_json["second"] = data.last_name
                    data_json["third"] = data.patronymic
                    update_values["data"] = json.dumps(data_json, ensure_ascii=False)
            except json.JSONDecodeError:
                pass

        stmt = update(DiscountCard).where(DiscountCard.id == card_id).values(**update_values)
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

async def change_phone(phone: str, new_phone: str, db: AsyncSession) -> bool:
    # Убираем всё, кроме цифр
    phone = ''.join(filter(str.isdigit, phone))
    new_phone = ''.join(filter(str.isdigit, new_phone))

    print('phone: ', phone)
    print('new_phone: ', new_phone)

    # Если телефон начинается с 7 или 8 — убираем
    if new_phone.startswith(('7', '8')) and len(new_phone) == 11:
        new_phone = new_phone[1:]

    if phone.startswith(('7', '8')) and len(phone) == 11:
        phone = phone[1:]

    print('phone: ', phone)
    print('new_phone: ', new_phone)

    # Проверяем формат
    if not (len(phone) == 10 and phone.startswith('9')):
        return False

    if not (len(new_phone) == 10 and new_phone.startswith('9')):
        return False

    # Ищем запись по старому номеру
    query = select(
        DiscountCard.id,
        DiscountCard.phone,
        DiscountCard.card_num,
        DiscountCard.data
    ).where(DiscountCard.phone == phone)

    result = await db.execute(query)
    row = result.first()

    print('row:', row)

    if not row:
        return False

    card_id, old_phone, old_card_num, data_str = row

    # Обновляем JSON data, если есть
    update_values = {
        "phone": new_phone,
        "card_num": new_phone
    }

    if data_str:
        try:
            data_json = json.loads(data_str)
            if isinstance(data_json, dict) and "phone" in data_json:
                data_json["phone"] = new_phone
                update_values["data"] = json.dumps(data_json, ensure_ascii=False)
        except json.JSONDecodeError:
            pass

    # Обновляем запись
    stmt = update(DiscountCard).where(DiscountCard.id == card_id).values(**update_values)
    await db.execute(stmt)
    await db.commit()

    return True

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

async def get_transfers(card_num: str, db: AsyncSession, count: int, page: int):
    discount_card_id = await get_user_discount_id_by_card(card_num=card_num, db=db)
    if not discount_card_id:
        return []

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
        .limit(count)
        .offset((page - 1) * count)
    )
    result = await db.execute(query)
    transfers = result.scalars().all()

    count_stmt = select(func.count()).where(
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
    total_count = await db.scalar(count_stmt)

    if not total_count:
        return {
            "total_pages": 0,
            "all_transfers": []
        }

    total_pages = math.ceil(total_count / count)

    transfer_history = []

    for t in transfers:
        prev_scores_query = (
            select(func.sum(UserScore.scores))
            .where(
                UserScore.card_id == discount_card_id,
                UserScore.date_added < t.date_added
            )
        )

        prev_result = await db.execute(prev_scores_query)
        previous_scores = prev_result.scalar() or 0
        previous_scores = float(previous_scores)

        if t.transfer_from == discount_card_id:
            amount = float(t.scores)
            target_id = t.transfer_to
        else:
            amount = float(t.scores)
            target_id = t.transfer_from

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
            "previous_scores": previous_scores,
            "new_scores": previous_scores + amount,
            "type": "Перевод",
            "receiptNumber": None
        })

    return {
        "total_pages": total_pages,
        "all_transfers": transfer_history
    }

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

async def get_total_operations(card_num: str, db: AsyncSession):
    discount_card_id = await get_user_discount_id_by_card(card_num=card_num, db=db)

    if not discount_card_id:
        return 0

    stmt_count = (
        select(func.count())
        .select_from(UserScore)
        .where(
            UserScore.card_id == discount_card_id,
            UserScore.base_id == base_id
        )
    )

    result = await db.execute(stmt_count)
    total_operations = result.scalar() or 0
    return total_operations

async def get_last_operations(card_num: str, db: AsyncSession, count: int, page: int):
    # Получаем ID карты пользователя
    discount_card_id = await get_user_discount_id_by_card(card_num=card_num, db=db)

    # Алиас для подзапроса подсчета before_scores
    US_prev = aliased(UserScore)

    # Подзапрос для sender/receiver FIO
    sender_fio_subq = (
        select(func.concat(DiscountCard.second, ' ', func.substr(DiscountCard.first, 1, 1), '.'))
        .where(DiscountCard.id == UserScore.transfer_from)
        .scalar_subquery()
    )
    receiver_fio_subq = (
        select(func.concat(DiscountCard.second, ' ', func.substr(DiscountCard.first, 1, 1), '.'))
        .where(DiscountCard.id == UserScore.transfer_to)
        .scalar_subquery()
    )

    order_sum_subq = (
        select(Orders.price)
        .where(Orders.id == UserScore.order_id)
        .scalar_subquery()
    )

    firm_address_subq = (
        select(Firm.name)
        .join(Orders, Orders.firm_id == Firm.id)
        .where(Orders.id == UserScore.order_id)
        .scalar_subquery()
    )

    before_scores_subq = (
        select(func.coalesce(func.sum(US_prev.scores), 0))
        .where(
            US_prev.card_id == discount_card_id,
            US_prev.date_added < UserScore.date_added
        )
        .scalar_subquery()
    )

    count_stmt = select(func.count()).where(
        UserScore.card_id == discount_card_id,
        UserScore.base_id == base_id
    )
    total_count = await db.scalar(count_stmt)

    if not total_count:
        return {
            "total_pages": 0,
            "last_operations": []
        }

    total_pages = math.ceil(total_count / count)

    stmt_operations = (
        select(
            UserScore.id,
            UserScore.order_id,
            UserScore.scores,
            UserScore.date_added,
            UserScore.status,
            case(
                (
                    (UserScore.transfer_from.is_(None)) &
                    (UserScore.transfer_to.is_(None)) &
                    (UserScore.order_id > 0),
                    func.concat('Чек на сумму ', order_sum_subq, ' ₽')
                ),
                (
                    (UserScore.transfer_from.is_(None)) & (UserScore.transfer_to.is_(None)) & (UserScore.scores > 0),
                    "Начисление баллов"
                ),
                (
                    (UserScore.transfer_from.is_(None)) & (UserScore.transfer_to.is_(None)) & (UserScore.scores < 0),
                    "Списание баллов"
                ),
                (
                    (UserScore.transfer_from.is_not(None)) & (UserScore.transfer_to.is_not(None)) & (UserScore.transfer_to == discount_card_id),
                    func.concat('Перевод от ', sender_fio_subq)
                ),
                (
                    (UserScore.transfer_from.is_not(None)) & (UserScore.transfer_to.is_not(None)) & (UserScore.transfer_from == discount_card_id),
                    func.concat('Перевод к ', receiver_fio_subq)
                ),
                else_=""
            ).label("title"),
            before_scores_subq.label("before_scores"),
            case(
                (
                    (UserScore.transfer_from.is_(None)) & 
                    (UserScore.transfer_to.is_(None)) & 
                    (UserScore.order_id > 0),
                    firm_address_subq
                ),
                else_=None
            ).label("address")
        )
        .where(
            UserScore.card_id == discount_card_id,
            UserScore.base_id == base_id
        )
        .order_by(desc(UserScore.date_added))
        .limit(count)
        .offset((page - 1) * count)
    )

    result_operations = await db.execute(stmt_operations)
    operations_row = result_operations.mappings().all()

    # --- Объединяем записи с одинаковым order_id ---
    combined_operations = {}
    for op in operations_row:
        order_id = op["order_id"] or f"none_{id(op)}"  # если order_id нет, делаем уникальный ключ
        if order_id in combined_operations:
            # суммируем баллы
            combined_operations[order_id]["scores"] += op["scores"]
            # можно обновлять дату/титул если нужно (например оставляем самую позднюю)
            if op["date_added"] > combined_operations[order_id]["date_added"]:
                combined_operations[order_id]["date_added"] = op["date_added"]
                combined_operations[order_id]["title"] = op["title"]
                combined_operations[order_id]["status"] = op["status"]
                combined_operations[order_id]["address"] = op["address"]
        else:
            combined_operations[order_id] = dict(op)

    last_operations = list(combined_operations.values())

    # Сортируем по дате заново после объединения
    last_operations.sort(key=lambda x: x["date_added"], reverse=True)

    return {
        "total_pages": total_pages,
        "last_operations": last_operations
    }

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

    stmt_score = (
        select(UserScore.scores)
        .where(
            UserScore.card_id == discount_card_id,
            UserScore.base_id == base_id,
            UserScore.status == 0
        )
    )
    result_score: Result = await db.execute(stmt_score)
    wait_scores_list = result_score.scalars().all()
    wait_scores = sum(wait_scores_list) if wait_scores_list else 0

    total_operations = await get_total_operations(card_num=card_num, db=db)

    return UserInfo(
        **user_row,
        total_score=total_score,
        wait_score=wait_scores,
        total_operations=total_operations,
        gifts=gifts_list
    )