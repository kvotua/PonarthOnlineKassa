from http.client import HTTPException
from typing import Any
from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession


from app.schemas.users_schemas import ChangeUser, InfoUserLoyaltySystem, UserInfo
from app.api.dependensies import get_access_token
from app.cruds import users_cruds
from app.databases.postgresdb import get_postgres_session
from app.databases.mysql_db import get_mysql_session
from app.cruds.verify_cruds import check_phone_in_discound
from app.utils import convert_decimal_to_float, get_current_user_with_bearer
from app.schemas.response_schemas import ResponseSchema


router = APIRouter(tags=["Users"])

@router.get('/profile', response_model=UserInfo)
async def get_profile(
    user_data = Depends(get_current_user_with_bearer),
    db: AsyncSession = Depends(get_mysql_session)
):
    phone = user_data['phone']
    userData = await users_cruds.get_user_loyalty_by_id(card_num=phone, db=db)
    return userData

@router.patch('/gift/open', response_model=Any)
async def open_gift(
    gift_id: int,
    user_data = Depends(get_current_user_with_bearer),
    db: AsyncSession = Depends(get_mysql_session)
):
    phone = user_data['phone']
    user_discount_card_id = await users_cruds.get_user_discount_id_by_card(card_num=phone, db=db)
    giftInfo = await users_cruds.get_gift_by_id(gift_id=gift_id, db=db)

    if not giftInfo:
        raise HTTPException(status_code=404, detail="Gift not found")
    
    print(giftInfo)
    
    if giftInfo.discount_card_id != user_discount_card_id:
        raise HTTPException(status_code=403, detail="This gift does not belong to you")
    
    if giftInfo.status == 'activated':
        raise HTTPException(status_code=409, detail="You have already activated this gift")
    
    if giftInfo.status == 'used':
        raise HTTPException(status_code=409, detail="You have already claimed prize from this gift")
    
    await users_cruds.activate_gift(gift_id=gift_id, db=db)

    return ResponseSchema(status_code=200, message="OK")

@router.patch('/change', response_model=Any)
async def change_user(
    data: ChangeUser,
    user_data = Depends(get_current_user_with_bearer),
    db: AsyncSession = Depends(get_mysql_session)
):
    phone = user_data['phone']

@router.patch('/telegram', response_model=Any)
async def change_telegram(
    send_telegram: bool = Body(..., embed=True),
    user_data = Depends(get_current_user_with_bearer),
    db: AsyncSession = Depends(get_mysql_session)
):
    phone = user_data['phone']

    result = await users_cruds.save_telegram(db=db, send_telegram=send_telegram, card_num=phone)
    if result:
        return ResponseSchema(status_code=200, message="Telegram send saved")
    return ResponseSchema(status_code=500, message="Error when saving telegram")


# @router.patch('/change', response_model=InfoUserLoyaltySystem)
# async def change_user(
#     data: ChangeUser,
#     session: AsyncSession = Depends(get_postgres_session),
#     token = Depends(get_access_token) 
# ):
#     pass