from enum import Enum
from pydantic import BaseModel, Field, model_validator
from typing import Annotated, List, Optional
from datetime import date, datetime
from fastapi import HTTPException

from app.utils import validate_phone


class GiftStatus(str, Enum):
    WAITING = "waiting"
    GIVEN = "given"
    ACTIVATED = "activated"
    USED = "used"

class GiftOrigin(str, Enum):
    NONE = "NONE"
    ORDER = "order"
    POLL = "poll"

class Gift(BaseModel):
    id: int = Field(title="ID подарка", example=1)
    title: str = Field(title="Название подарка", example="Подарочный сертификат")
    description: str = Field(title="Описание подарка", example="Сертификат на 500 ₽")
    good_id: Optional[int] = Field(title="ID товара", example=23928)
    sect_id: Optional[int] = Field(title="ID категории товаров", example=12)
    discount_card_id: int = Field(title="ID карты лояльности", example=1)
    order_id: Optional[int] = Field(title="ID заказа", example=1191098)
    poll_id: Optional[int] = Field(title="ID опроса", example=11150)
    quantity: Optional[float] = Field(title="Количество", example=1.0)
    status: GiftStatus = Field(title="Статус подарка", example=GiftStatus.WAITING)
    origin: GiftOrigin = Field(title="Происхождение купона", example=GiftOrigin.ORDER)
    present_date: Optional[datetime] = Field(title="Дата выдачи", example="2025-10-30T15:47:54")
    date_end: Optional[datetime] = Field(title="Срок действия", example="2025-12-31T23:59:59")
    date_used: Optional[datetime] = Field(title="Дата получения", example=None)
    date_cancelled: Optional[datetime] = Field(title="Дата аннулирования", example=None)
    
    score: Optional[int] = Field(title='Количество баллов которые будут начислены после получения награды', example=150)
    cashback: Optional[float] = Field(title='Множитель кэшбека для покупки', example=1.5)

    date_added: Optional[datetime] = Field(title='Дата добавления купона', example="2025-10-30T15:47:54")
    emoji: Optional[str] = Field(title='Эмодзи подарка', example='🖼')
     
class RegisterFioUserLoyaltySystem(BaseModel):
    full_name: Annotated[str, Field(title="The user's full name", examples=["Иванов Иван Иванович"])]
    birth_date: Annotated[date, Field(title="The user's birth date", examples=["1984-12-07"])]
    gender: Annotated[int, Field(title="1-Male, 2-Female", examples=[1], ge=1, le=2)]
    call_id: Annotated[int, Field(title='The ID received after sending the number', examples=['1191273219673078'])]
    referal_discount_card_id: Annotated[Optional[int], Field(title="Referal Discount Card ID", examples=[3955057, 3940099])]

class RegisterUserLoyaltySystem(BaseModel):
    last_name: Annotated[str, Field(title="The user's last name", examples=["Игнатьев"])]
    first_name: Annotated[str, Field(title="The user's first name", examples=["Алексей"])]
    patronymic: Annotated[Optional[str], Field(title="The user's patronymic", examples=["Алиевич"])]
    birth_date: Annotated[date, Field(title="The user's birth date", examples=["2024-12-07"])]
    gender: Annotated[int, Field(title="1-Male, 2-Female", examples=[1], ge=1, le=2)]
    call_id: Annotated[int, Field(title='The ID received after sending the number', examples=['1191273219673078'])]
    referal_discount_card_id: Annotated[Optional[int], Field(title="Referal Discount Card ID", examples=[3955057, 3940099])]

class ReferalInfo(BaseModel):
    referals: Annotated[int, Field(title='Количество ваших рефералов', examples=[1, 12, 0, 5])]
    last_month: Annotated[float, Field(title='Полученная сумма за прошлый месяц', examples=[1200, 1500, 100, 5000])]
    current_month: Annotated[float, Field(title='Полученная сумма за текущий месяц', examples=[1200, 1500, 100, 5000])]
    total: Annotated[float, Field(title='Всего накоплено с рефералов', examples=[2250, 5100, 5500, 1050])]

class UserInfo(BaseModel):
    id: Annotated[int, Field(title="ID Discount_card", examples=[1])]
    card_num: Annotated[Optional[str], Field(title="ID Discount_card", examples=["card_num"], default=None)]
    phone: Annotated[int, Field(title="ID Discount_card", examples=[9632928738])]
    first: Annotated[str, Field(title="ID Discount_card", examples=["Игнатьев"])]
    second: Annotated[str, Field(title="ID Discount_card", examples=["Алексей"])]
    third: Annotated[Optional[str], Field(title="ID Discount_card", examples=["Алиевич"])]
    bday: Annotated[date, Field(title="ID Discount_card", examples=["2004-12-07"])]
    gender: Annotated[int, Field(title="ID Discount_card", examples=[1])]
    email: Annotated[Optional[str], Field(title="ID Discount_card", examples=["example@gmail.com"], default=None)]
    telegram: Annotated[Optional[int], Field(title="ID Discount_card", examples=[112345123], default=None)]
    send_telegram: Annotated[Optional[int], Field(title="ID Discount_card", examples=[1], default=None)]
    chat_id: Annotated[Optional[str], Field(title="ID Discount_card", examples=[""], default=None)]
    date_added: Annotated[datetime, Field(title="ID Discount_card", examples=["2025-05-17T20:07:00.803074"], default=None)]
    gifts: Annotated[List[Gift], Field(title="Купоны пользователя", default_factory=list)]
    total_score: Annotated[float, Field(title="User Points", examples=[100, 224, 150])]
    wait_score: Annotated[float, Field(title="User waiting Points", examples=[100, 224, 150])]
    total_operations: Annotated[int, Field(title="User all operations", examples=[0, 10, 5, 6, 8])]

class InfoUserLoyaltySystem(BaseModel):
    id: Annotated[int, Field(title="ID Discount_card", examples=[1])]
    base_id: Annotated[int, Field(title="ID ", examples=[2])]
    mag_id: Annotated[int, Field(title="Firm ID", examples=[3])]
    active: Annotated[int, Field(title="ID Discount_card", examples=[4])] 
    status: Annotated[int, Field(title="ID Discount_card", examples=[5])]
    user_id: Annotated[int, Field(title="ID Discount_card", examples=[6])]
    card_num: Annotated[Optional[str], Field(title="ID Discount_card", examples=["card_num"], default=None)]
    card_old_num: Annotated[Optional[str], Field(title="ID Discount_card", examples=["card_old_num"], default=None)]
    discount_id: Annotated[int, Field(title="ID Discount_card", examples=[7])]
    phone: Annotated[int, Field(title="ID Discount_card", examples=[9632928738])]
    send_check: Annotated[int, Field(title="ID Discount_card", examples=[1])]
    phone_pass: Annotated[Optional[str], Field(title="ID Discount_card", examples=[""], default=None)]
    phone_verify: Annotated[int, Field(title="ID Discount_card", examples=[1])]
    first: Annotated[str, Field(title="ID Discount_card", examples=["Игнатьев"])]
    second: Annotated[str, Field(title="ID Discount_card", examples=["Алексей"])]
    third: Annotated[str, Field(title="ID Discount_card", examples=["Алиевич"])]
    boss: Annotated[int, Field(title="ID Discount_card", examples=[0])]
    bday: Annotated[date, Field(title="ID Discount_card", examples=["2004-12-07"])]
    gender: Annotated[int, Field(title="ID Discount_card", examples=[1])]
    email: Annotated[Optional[str], Field(title="ID Discount_card", examples=["example@gmail.com"], default=None)]
    photo: Annotated[Optional[str], Field(title="ID Discount_card", examples=[""], default=None)]
    adress: Annotated[Optional[str], Field(title="ID Discount_card", examples=[""], default=None)]
    avg_check: Annotated[Optional[int], Field(title="ID Discount_card", examples=[10], default=None)]
    koef: Annotated[Optional[float], Field(title="ID Discount_card", examples=[0.9], default=None)]
    telegram: Annotated[Optional[int], Field(title="ID Discount_card", examples=[112345123], default=None)]
    send_telegram: Annotated[Optional[int], Field(title="ID Discount_card", examples=[1], default=None)]
    chat_id: Annotated[Optional[str], Field(title="ID Discount_card", examples=[""], default=None)]
    mode: Annotated[Optional[str], Field(title="ID Discount_card", examples=[""], default=None)]
    date_added: Annotated[datetime, Field(title="ID Discount_card", examples=["2025-05-17T20:07:00.803074"], default=None)]


class ChangeUser(BaseModel):
    last_name: Annotated[Optional[str], Field(title="The user's last name", examples=["Игнатьев"], default=None)]
    first_name: Annotated[Optional[str], Field(title="The user's first name", examples=["Алексей"], default=None)]
    patronymic: Annotated[Optional[str], Field(title="The user's patronymic", examples=["Алиевич"], default=None)]

class TransferScoreRequest(BaseModel):
    phone: Annotated[str, Field(title="Phone number", examples=['+79632928738'])]
    scores: Annotated[float, Field(title="Scores", examples=[100, 150, 200, 50])]

    @model_validator(mode="before")
    def validate_phone(cls, values):
        phone = values.get('phone')
        if phone:
            try:
                valid_phone = validate_phone(phone)
                if valid_phone is None:
                    raise ValueError("Invalid phone number")
                else:
                    values["phone"] = valid_phone
            except:
                raise ValueError("Invalid phone number")
        return values
    
class PaginationRequest(BaseModel):
    pages: Optional[int] = Field(10, title="Pages count", examples=[10, 15, 25])
    page: Optional[int] = Field(1, title="Page", examples=[1, 2, 3, 4, 5])

# class RegisterUserDiscount(BaseModel):
#     mag_id: Annotated[int]
#     active: Annotated[int]
#     status: Annotated[int]
#     user_id: Annotated[int]
#     card_num: Annotated[str]
#     card_old_num: Annotated[str]
#     discount_id: Annotated[int]
#     phone: Annotated[str]
#     send_check: Annotated[]
#     phone_pass: Annotated[]
#     phone_verify: Annotated[]
#     first: Annotated[]
#     second: Annotated[]
#     third: Annotated[]
#     boss: Annotated[]
#     bday: Annotated[]
#     gender: Annotated[]
#     email: Annotated[]
#     photo: Annotated[]
#     adress: Annotated[]
#     avg_check: Annotated[]
#     koef: Annotated[]
#     telegram: Annotated[]
#     send_telegram: Annotated[]
#     chat_id: Annotated[]
#     mode: Annotated[]
#     date_added: Annotated[]
#     data: Annotated[]