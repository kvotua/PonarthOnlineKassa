from decimal import Decimal
import enum
from typing import Optional

from sqlalchemy import BigInteger, Boolean, CheckConstraint, Enum, Index, SmallInteger, Text, Integer, Date, DECIMAL, Time, func, VARCHAR, JSON, Column, String, \
    DateTime, Numeric, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, date, time

from app.config import base_id, firm_id, discount_id

class GiftStatus(enum.Enum):
    WAITING = "waiting"
    GIVEN = "given"
    ACTIVATED = "activated"
    USED = "used"

class GiftOrigin(enum.Enum):
    ORDER = "order"
    POLL = "poll"

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
    referal_discount_card_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
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

class Good(Base_mysql):
    __tablename__ = 'good'

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    status: Mapped[int] = mapped_column(Integer, default=0, comment='1 - товар удалён')
    base_id: Mapped[int] = mapped_column(Integer)
    firm_id: Mapped[int] = mapped_column(Integer)
    mag_id: Mapped[int] = mapped_column(Integer)
    sect_id: Mapped[int] = mapped_column(BigInteger)
    sect_menu_id: Mapped[int] = mapped_column(Integer, default=1)
    active: Mapped[int] = mapped_column(Integer, default=0)
    no_more_need: Mapped[int] = mapped_column(Integer, default=0, comment='1- больше не заказываем')
    name: Mapped[str] = mapped_column(String(300))
    name_kassa: Mapped[str] = mapped_column(String(50))
    shtrih: Mapped[str] = mapped_column(String(100))
    contr_id: Mapped[int] = mapped_column(Integer)
    country: Mapped[int] = mapped_column(Integer, default=1, comment='Страна-производитель')
    edinica: Mapped[int] = mapped_column(Integer, default=0, comment='1 - литры, 2 - кг, 3 - шт')
    kega: Mapped[int] = mapped_column(Integer, default=0, comment='1-вести учёт по кегам')
    srok: Mapped[date] = mapped_column(Date, comment='срок годности', nullable=True)
    srok_user_id: Mapped[int] = mapped_column(Integer)
    kran1: Mapped[int] = mapped_column(Integer, default=0)
    kran2: Mapped[int] = mapped_column(Integer, default=0)
    ibu: Mapped[float] = mapped_column(Numeric(11, 2))
    alco: Mapped[float] = mapped_column(Numeric(11, 2))
    og: Mapped[float] = mapped_column(Numeric(11, 2))
    perfect: Mapped[str] = mapped_column(String(500), comment='С чем употреблять')
    info: Mapped[str] = mapped_column(String(500), comment='Сроки хранения')
    logo: Mapped[str] = mapped_column(String(300))
    bottle: Mapped[int] = mapped_column(Integer, default=0, comment='1-это бытулка')
    day_sale: Mapped[float] = mapped_column(Numeric(10, 2))
    pribil: Mapped[float] = mapped_column(Numeric(10, 2))
    week_sale: Mapped[float] = mapped_column(Numeric(10, 2))
    tweek_sale: Mapped[float] = mapped_column(Numeric(10, 2))
    month_sale: Mapped[float] = mapped_column(Numeric(10, 2))
    pol_sale: Mapped[float] = mapped_column(Numeric(10, 2))
    year_sale: Mapped[float] = mapped_column(Numeric(10, 2))
    all_year: Mapped[float] = mapped_column(Numeric(10, 2))
    min_zakaz: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)
    max_zakaz: Mapped[float] = mapped_column(Numeric(10, 2))
    ordered: Mapped[datetime] = mapped_column(DateTime, comment='дата и время когда товар заказан')
    ordered_count: Mapped[float] = mapped_column(Numeric(10, 2))
    sort: Mapped[int] = mapped_column(Integer, default=1000)
    mark: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[int | None] = mapped_column(Integer, nullable=True)

class GoodPrice(Base_mysql):
    __tablename__ = 'good_price'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    good_id = Column(BigInteger)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False,  comment='ID пользователя')
    status: Mapped[int] = mapped_column(Integer, nullable=False,  default=1,comment='0 - не активен, 1 - активен' )
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.00, comment='Цена' )
    price_real: Mapped[float] = mapped_column(Numeric(10, 2),nullable=False, comment='Реальная цена' )
    date_added: Mapped[datetime] = mapped_column(DateTime, nullable=False,  server_default=func.now(),  comment='Дата добавления')

    __table_args__ = (  PrimaryKeyConstraint('id', 'date_added'),  {'comment': 'Таблица цен товаров'},  )


class Sections(Base_mysql):
    __tablename__ = 'sections'

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    status: Mapped[int] = mapped_column(Integer, nullable=False)
    base_id: Mapped[int] = mapped_column(Integer, nullable=False)
    firm_id: Mapped[int] = mapped_column(Integer, nullable=False)
    mag_id: Mapped[int] = mapped_column(Integer, nullable=False)
    active: Mapped[int] = mapped_column(Integer, server_default="1", nullable=False)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    marzha: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    sort: Mapped[int] = mapped_column(Integer, server_default="1000", nullable=False)

class Orders(Base_mysql):
    __tablename__ = 'orders'

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    status: Mapped[int] = mapped_column(BigInteger, nullable=True)
    date_added: Mapped[int] = mapped_column(BigInteger, nullable=True)
    date_first_good_added: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    date_good_changed: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    date_good_del: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    date_otloz_in: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    date_otloz_out: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    date_closed: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    date_updated: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    price_real: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    price_save: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    scores: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    no_scores: Mapped[int] = mapped_column(BigInteger, nullable=True)
    firm_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    magazine_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    card_num: Mapped[str] = mapped_column(String(100), nullable=True)
    card_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    discount_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    terminal: Mapped[int] = mapped_column(BigInteger, nullable=True)
    stock: Mapped[int] = mapped_column(BigInteger, nullable=True)
    old_new: Mapped[int] = mapped_column(BigInteger, nullable=True)
    sdacha: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    agree: Mapped[int] = mapped_column(BigInteger, nullable=True)
    agree_sms: Mapped[int] = mapped_column(BigInteger, nullable=True)
    agree_sms_code: Mapped[str] = mapped_column(String(10), nullable=True)
    print_check: Mapped[int] = mapped_column(BigInteger, nullable=True)
    short: Mapped[str] = mapped_column(String(300), nullable=True)
    fn: Mapped[str] = mapped_column(String(300), nullable=True)
    fd: Mapped[str] = mapped_column(String(300), nullable=True)
    fpd: Mapped[str] = mapped_column(String(300), nullable=True)
    qr_line: Mapped[str] = mapped_column(String(300), nullable=True)
    online_not_print: Mapped[int] = mapped_column(BigInteger, nullable=True)

class Basket(Base_mysql):
    __tablename__ = 'basket'

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    date_added: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    date_updated: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    status: Mapped[int] = mapped_column(BigInteger, nullable=True)
    order_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    firm_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    magazine_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    user_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    good_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    sect_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    kega_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    discount_proc: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    no_price_change: Mapped[int] = mapped_column(BigInteger, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    price_wo: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    price_real: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    price_save: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    price_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    terminal: Mapped[int] = mapped_column(BigInteger, nullable=True)
    znac: Mapped[float] = mapped_column(Numeric(10, 3), nullable=True)
    znac_in_check: Mapped[float] = mapped_column(Numeric(10, 3), nullable=True)
    new_name: Mapped[str] = mapped_column(String(50), nullable=True)
    mark: Mapped[str] = mapped_column(String(255), nullable=True)
    reqId: Mapped[str] = mapped_column(String(255), nullable=True)
    reqTimestamp: Mapped[str] = mapped_column(String(255), nullable=True)

class Users(Base_mysql):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    active: Mapped[int] = mapped_column(BigInteger, nullable=True)
    date_registered: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    last_auth: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    base_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    firm_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    mag_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    login: Mapped[str] = mapped_column(String(150), nullable=True)
    password: Mapped[str] = mapped_column("pass", String(150), nullable=True)
    status: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    fio: Mapped[int] = mapped_column(String(150), nullable=True)
    smena_fio: Mapped[str] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(100), nullable=True)
    pay: Mapped[int] = mapped_column(BigInteger, nullable=True)
    pay_sum: Mapped[int] = mapped_column(BigInteger, nullable=True)
    pay_hour: Mapped[int] = mapped_column(BigInteger, nullable=True)
    user_level_id: Mapped[int] = mapped_column(BigInteger, nullable=True)
    is_helper: Mapped[int] = mapped_column(BigInteger, nullable=True)
    show_remains: Mapped[int] = mapped_column(BigInteger, nullable=True)
    time_from: Mapped[time] = mapped_column(Time, nullable=True)
    time_to: Mapped[time] = mapped_column(Time, nullable=True)
    nalog: Mapped[int] = mapped_column(BigInteger, nullable=True)
    no_telegram: Mapped[int] = mapped_column(BigInteger, nullable=True)
    telegram_phone: Mapped[str] = mapped_column(String(15), nullable=True)
    chat_id: Mapped[str] = mapped_column(String(30), nullable=True)
    cookie: Mapped[str] = mapped_column(String(32), nullable=True)
    photo: Mapped[str] = mapped_column(String(200), nullable=True)
    referer: Mapped[str] = mapped_column(String(300), nullable=True)

class Gift(Base_mysql):
    __tablename__ = 'gift'
    
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(30), comment='Название подарка')
    description: Mapped[str] = mapped_column(String(250), comment='Описание подарка')
    
    good_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('good.id'), nullable=True, comment='ID товара')
    sect_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('sections.id'), nullable=True, comment='ID категории товаров')
    discount_card_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('discount_cards.id'), comment='ID карты лояльности')

    order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('orders.id'), comment='ID заказа', nullable=True)
    poll_id: Mapped[int] = mapped_column(BigInteger, comment='ID опроса', nullable=True)
    
    quantity: Mapped[int] = mapped_column(BigInteger, comment='Количество товара')
    
    origin: Mapped[GiftOrigin] = mapped_column(Enum(GiftOrigin), default=GiftOrigin.ORDER, comment='Происхождение купона (заказ/опрос)')
    status: Mapped[GiftStatus] = mapped_column(Enum(GiftStatus), default=GiftStatus.WAITING, comment='Статус купона')
    present_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), comment='Дата выдачи купона')
    date_end: Mapped[datetime] = mapped_column(DateTime, comment='Срок окончания действия')
    
    date_used: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment='Дата получения подарка')
    date_cancelled: Mapped[datetime] = mapped_column(DateTime, nullable=True, comment='Дата аннулирования купона')

    __table_args__ = (
        Index('ix_gift_discount_card_status', 'discount_card_id', 'status'),
        Index('ix_gift_date_end_status', 'date_end', 'status'),
        CheckConstraint('quantity > 0', name='check_positive_quantity'),
        CheckConstraint('date_end > present_date', name='check_valid_dates'),
    )
