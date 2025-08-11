from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, SmallInteger, Text, Integer, Date, DECIMAL, func, VARCHAR, JSON, Column, String, DateTime, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, date

from app.config import base_id, firm_id, discount_id


Base_mysql = declarative_base()

class DiscountCard(Base_mysql):
    __tablename__ = 'discount_cards'

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    base_id: Mapped[int] = mapped_column(Integer, nullable=False, default=int(base_id))
    mag_id: Mapped[int] = mapped_column(Integer, nullable=False, default=int(firm_id))
    active: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=1)  # 0-не активна, 1-активна
    status: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=1)  # 0-не подтверждена, 1-подтверждена
    user_id: Mapped[int] = mapped_column(Integer, nullable=True)
    card_num: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    card_old_num: Mapped[str] = mapped_column(VARCHAR(50), nullable=True)
    discount_id: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=int(discount_id))
    phone: Mapped[str] = mapped_column(VARCHAR(10), nullable=True)
    send_check: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=1)  # 1-отсылать чек по смс
    phone_pass: Mapped[str] = mapped_column(VARCHAR(5), nullable=True)
    phone_verify: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=0)
    first: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    second: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    third: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    boss: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=0)
    bday: Mapped[date] = mapped_column(Date, nullable=False)
    gender: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=0)  # 1-м, 2-ж
    email: Mapped[str] = mapped_column(VARCHAR(100), nullable=True)
    photo: Mapped[str] = mapped_column(VARCHAR(150), nullable=True)
    adress: Mapped[str] = mapped_column(Text, nullable=True)
    avg_check: Mapped[int] = mapped_column(Integer, nullable=True)
    koef: Mapped[float] = mapped_column(DECIMAL(10, 2), nullable=True)
    telegram: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=0)
    send_telegram: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=False, default=1)  # 0-не отсылать ничего
    chat_id: Mapped[str] = mapped_column(Text, nullable=True)
    mode: Mapped[str] = mapped_column(Text, nullable=True)
    date_added: Mapped[datetime] = mapped_column(server_default=func.now())
    data: Mapped[dict] = mapped_column(JSON,deferred=True)


class Verification(Base_mysql):
    __tablename__ = 'verification'

    call_id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=False)
    code: Mapped[str] = mapped_column(VARCHAR(4))
    phone: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    verified: Mapped[int] = mapped_column(SmallInteger, default=0)


class UserScore(Base_mysql):
    __tablename__ = 'users_scores'

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    date_added: Mapped[datetime] = mapped_column(server_default=func.now())
    status: Mapped[SmallInteger] = mapped_column(SmallInteger, nullable=True, default=1)  # 0-не подтверждено, 1-подтверждено
    base_id: Mapped[int] = mapped_column(Integer, nullable=False, default=int(base_id))
    order_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    card_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    scores: Mapped[float] = mapped_column(DECIMAL(12, 2), nullable=False)

