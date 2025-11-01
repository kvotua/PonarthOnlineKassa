
from sqlalchemy import desc, func, select
from app.models.mysql import Good, GoodPrice, Basket, DiscountCard, Orders, UserScore, Users
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

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
        .where(Basket.order_id == order_id)
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
            Users.smena_fio.label("short_fio")
        )
        .join(Users, Users.id == Orders.user_id, isouter=True)
        .where(Orders.id == order_id)
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
            UserScore.order_id < order_id
        )
        .group_by(DiscountCard.first, DiscountCard.second)
    )

    score_result = await db.execute(score_stmt)
    result = score_result.first()

    previous_scores = float(result.total_scores or 0)
    first = result.first
    second = result.second

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
        "goods": goods_list,
    }

async def get_all_baskets_by_card(db: AsyncSession, card_num: str):
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
            Users.fio.label("full_fio"),
            Users.smena_fio.label("short_fio")
        )
        .join(Users, Users.id == Orders.user_id, isouter=True)
        .join(DiscountCard, Orders.card_num == DiscountCard.card_num)
        .where(
            Orders.card_num == card_num,
            Orders.date_closed >= six_months_ago
        )
        .order_by(desc(Orders.id))
    )

    order_result = await db.execute(order_stmt)
    order_rows = order_result.mappings().all()

    if not order_rows:
        return []

    all_orders = []

    for order in order_rows:
        order_id = order["id"]
        basket_rows = await get_basket_by_order_id(db=db, order_id=order_id)
        user = {
            "id": order['user_id'],
            "full_fio": order['full_fio'],
            "short_fio": order['short_fio'],
        }

        if not basket_rows:
            continue

        score_stmt = (
            select(func.coalesce(func.sum(UserScore.scores), 0))
            .join(DiscountCard, UserScore.card_id == DiscountCard.id)
            .where(
                DiscountCard.card_num == card_num,
                UserScore.status == 1,
                UserScore.order_id < order_id
            )
        )
        score_result = await db.execute(score_stmt)
        previous_scores = score_result.scalar()

        order_total = order['price']
        price_real = order['price_real']
        score_added = order['price_save']
        score_subtracted = order['scores']

        goods_list = [
            {
                "good_id": row["good_id"],
                "good_name": row["good_name"],
                "price": float(row["price"] or 0),
                "type": row["edinica"],
                "count": float(row["znac"]),
                "unit_price": float(row["price"] / row["znac"])
            }
            for row in basket_rows
        ]

        all_orders.append({
            "order_id": order_id,
            "user": user,
            "buyer": "123",
            "date": order['date'],
            "price_total": order_total,
            "price_real": price_real,
            "score_added": score_added,
            "score_subtracted": score_subtracted,
            "previous_scores": float(previous_scores),
            "goods": goods_list,
        })

    return all_orders