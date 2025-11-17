
from decimal import Decimal
import math
from sqlalchemy import desc, func, select
from app.models.mysql import Gift, GiftStatus, Good, GoodPrice, Basket, DiscountCard, Orders, UserScore, Users
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from app.config import base_id, firm_id

async def get_basket_by_order_id(db: AsyncSession, order_id: int):
    stmt = (
        select(
            Basket.good_id,
            Basket.price,
            Basket.order_id,
            Good.edinica,
            Basket.znac,
            Good.name.label("good_name"),
        )
        .select_from(Basket)
        .join(Good, Good.id == Basket.good_id, isouter=True)
        .where(Basket.order_id == order_id,
        Good.base_id == base_id, 
        Good.firm_id == firm_id)
    )
    result = await db.execute(stmt)
    return result.mappings().all()

async def get_order_by_id(db: AsyncSession, order_id: int):
    order_stmt = (
        select(
            Orders.id,
            Orders.user_id,
            Orders.date_closed.label("date"),
            Orders.price,
            Orders.price_save,
            Orders.price_real,
            Orders.scores,
            Orders.card_num,
            Users.fio.label("full_fio"),
            Users.smena_fio.label("short_fio"),
            Gift.title.label("gift_title"),
            Gift.emoji.label("gift_emoji"),
        )
        .join(Users, Users.id == Orders.user_id, isouter=True)
        .join(Gift, Gift.id == Orders.gift_id, isouter=True)
        .where(Orders.id == order_id, Orders.firm_id == firm_id)
    )

    order_result = await db.execute(order_stmt)
    order = order_result.mappings().first()

    if not order:
        return None

    basket_rows = await get_basket_by_order_id(db=db, order_id=order_id)
    if not basket_rows:
        return None

    score_stmt = (
        select(
            func.coalesce(func.sum(UserScore.scores), 0).label("total_scores"),
            DiscountCard.first,
            DiscountCard.second
        )
        .join(DiscountCard, UserScore.card_id == DiscountCard.id)
        .where(
            DiscountCard.card_num == order["card_num"],
            UserScore.status == 1,
            UserScore.order_id < order_id, UserScore.base_id == base_id
        )
        .group_by(DiscountCard.first, DiscountCard.second)
    )

    score_result = await db.execute(score_stmt)
    result = score_result.first()

    previous_scores = 0

    if result:
        previous_scores= float(result.total_scores)
    first = result.first if result else ""
    second = result.second if result else ""

    user = {
        "id": order["user_id"],
        "full_fio": order["full_fio"],
        "short_fio": order["short_fio"],
    }

    goods_list = [
        {
            "good_id": row["good_id"],
            "good_name": row["good_name"],
            "price": float(row["price"] or 0),
            "type": row["edinica"],
            "count": float(row["znac"]),
            "unit_price": float(row["price"] / row["znac"]) if row["znac"] else 0
        }
        for row in basket_rows
    ]

    gift_title = order["gift_title"]
    gift_emoji = order["gift_emoji"]

    return {
        "order_id": order_id,
        "user": user,
        "buyer": f"{first} {second}",
        "date": order["date"],
        "price_total": order["price"],
        "price_real": order["price_real"],
        "score_added": order["price_save"],
        "score_subtracted": order["scores"],
        "previous_scores": previous_scores,
        "gift": {
            "title": gift_title,
            "emoji": gift_emoji
        },
        "goods": goods_list,
    }

async def get_all_baskets_by_card(db: AsyncSession, card_num: str, count: int, page: int):
    six_months_ago = datetime.now() - timedelta(days=180)

    order_stmt = (
        select(
            Orders.id, 
            Orders.user_id,
            Orders.date_closed.label("date"),
            Orders.price,
            Orders.price_save,
            Orders.price_real,
            Orders.scores,
            Orders.gift_id,
        )
        .where(
            Orders.card_num == card_num,
            Orders.date_closed >= six_months_ago,
            Orders.firm_id == firm_id
        )
        .order_by(desc(Orders.id))
        .limit(count)
        .offset((page - 1) * count)
    )

    count_stmt = select(func.count()).where(
        Orders.card_num == card_num,
        Orders.date_closed >= six_months_ago,
        Orders.firm_id == firm_id
    )
    total_count = await db.scalar(count_stmt)

    if not total_count:
        return {
            "total_pages": 0,
            "all_orders": []
        }

    total_pages = math.ceil(total_count / count)

    order_result = await db.execute(order_stmt)
    order_rows = order_result.mappings().all()

    if not order_rows:
        return []

    all_orders = []

    for order in order_rows:
        order_id = order["id"]

        # Получаем user по user_id
        user_stmt = select(
            Users.id,
            Users.fio.label("full_fio"),
            Users.smena_fio.label("short_fio")
        ).where(Users.id == order["user_id"])
        user_result = await db.execute(user_stmt)
        user_row = user_result.mappings().first()

        user = {
            "id": user_row["id"] if user_row else None,
            "full_fio": user_row["full_fio"] if user_row else None,
            "short_fio": user_row["short_fio"] if user_row else None,
        }

        basket_rows = await get_basket_by_order_id(db=db, order_id=order_id)
        if not basket_rows:
            continue

        # Получаем previous_scores
        score_stmt = (
            select(
                func.coalesce(func.sum(UserScore.scores), 0).label('total_scores'),
                DiscountCard.first,
                DiscountCard.second
            )
            .join(DiscountCard, UserScore.card_id == DiscountCard.id)
            .where(
                DiscountCard.card_num == card_num,
                UserScore.status == 1,
                UserScore.order_id < order_id,
                UserScore.base_id == base_id
            )
            .group_by(DiscountCard.first, DiscountCard.second)
        )
        score_result = await db.execute(score_stmt)
        result = score_result.first()

        previous_scores = 0

        if result:
            previous_scores= float(result.total_scores)
        first = result.first if result else ""
        second = result.second if result else ""

        goods_list = [
            {
                "good_id": row["good_id"],
                "good_name": row["good_name"],
                "price": float(row["price"] or 0),
                "type": row["edinica"],
                "count": float(row["znac"]),
                "unit_price": float(row["price"] / row["znac"]) if row["znac"] else 0
            }
            for row in basket_rows
        ]

        gift_emoji = None
        if order["gift_id"]:
            gift_stmt = select(Gift.emoji, Gift.status).where(Gift.id == order["gift_id"])
            gift_result = await db.execute(gift_stmt)
            gift_row = gift_result.mappings().first()
            if gift_row:
                status = gift_row["status"]
                if status in (GiftStatus.ACTIVATED, GiftStatus.USED):
                    gift_emoji = gift_row["emoji"]
                elif status == GiftStatus.GIVEN:
                    gift_emoji = "🎁"

        new_scores = (
            Decimal(str(previous_scores)) +
            Decimal(order['price_save']) +
            - Decimal(order['scores'])
        )

        all_orders.append({
            "order_id": order_id,
            "user": user,
            "buyer": f"{first} {second}",
            "date": order['date'],
            "price_total": order['price'],
            "price_real": order['price_real'],
            "score_added": order['price_save'],
            "score_subtracted": order['scores'],
            "previous_scores": previous_scores,
            "new_scores": new_scores,
            "gift_emoji": gift_emoji,
            "goods": goods_list,
        })

    return {
        "total_pages": total_pages,
        "all_orders": all_orders
    }