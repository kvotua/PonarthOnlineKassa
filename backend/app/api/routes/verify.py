from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse

from app.models.mysql import DiscountCard
from app.schemas.verify_schemas import Phone, CheckPhoneCode
from app.cruds import users_cruds, verify_cruds
from app.utils import get_current_user_from_cookie, send_message, convert_decimal_to_float, generate_info_for_telegram, send_telegram_message
from app.cruds.verify_cruds import add_verify_session, get_verify_session, change_verify_status, check_phone_in_discound, add_verify_change_phone_session, get_verify_phone_change_session
from app.schemas.response_schemas import CallID, ResponseSchema, json_response
from app.databases.postgresdb import get_postgres_session
from app.databases.mysql_db import get_mysql_session


router = APIRouter(prefix='/verify', tags=["Verify"])

@router.post('/phone/change/send', response_model=CallID)
async def send_phone_change_code(
    phone: Phone,
    user_data=Depends(get_current_user_from_cookie),
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    old_phone = user_data['phone']
    response = await users_cruds.get_user_discount_id_by_card(card_num=phone.phone[1:], db=session_mysql)
    print(response)
    if not response:
        response_send = await send_message(phone=phone.phone)
        response_data = response_send['data']
        print("Zvonok API response:", response_send)
        if response_send['status'] == 'error':
            raise HTTPException(status_code=500,
                                detail=f"Zvonok API Error: {response_data}")
        await add_verify_change_phone_session(call_id=response_data['call_id'], code=response_data['pincode'], new_phone=phone.phone[1:], old_phone=old_phone, session_mysql=session_mysql)
        if response is not None and response is not False and (response or response == 0):
            raise HTTPException(status_code=400,
                        detail=f"Phone already registered")
        return CallID(call_id=response_data['call_id'], call_type='register')
    raise HTTPException(status_code=400,
                        detail=f"Phone already registered")

@router.post('/phone/send', response_model=CallID)
async def send_code(
    phone: Phone,
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    response = await check_phone_in_discound(phone=phone.phone[1:], session_mysql=session_mysql)
    print(response)
    # if not response:
        # scores = convert_decimal_to_float(response)
        # if isinstance(scores, (int, float)):
        #     scores = [scores]
        # total_score = sum(scores) if scores else 0

        # stmt = select(DiscountCard).where(DiscountCard.phone == phone.phone[1:])
        # result = await session_mysql.execute(stmt)
        # user = result.scalars().first()
        # response_data = {
        #     "status_code": 400,
        #     "message": "User is already registered",
        #     "scores": total_score,
        # }
        # if user:
        #     response_data.update({
        #             "date_added": user.date_added.isoformat() if user.date_added else None,
        #             "first": user.first,
        #             "third": user.third,
        #     })
        #     return JSONResponse(status_code=200, content=response_data)
    if phone.call_type:
        if phone.call_type == 'telegram':
            response_send = generate_info_for_telegram()
            if response is None or response is False:
                response_data = response_send['data']
                await add_verify_session(call_id=response_data['call_id'], code=response_data['pincode'], phone=phone.phone[1:], session_mysql=session_mysql)
                raise HTTPException(
                    status_code=422,
                    detail={"call_id": response_data['call_id'], "error": "no_account_for_telegram", "message": "Пользователь не имеет аккаунт для подтверждения входа через Telegram"}
                )
            tg_chat_id = await users_cruds.get_user_telegram(card_num=phone.phone[1:], db=session_mysql)
            if int(tg_chat_id) > 0:
                response_tg = await send_telegram_message(chat_id=tg_chat_id, text=f'Код для входа в систему лояльности: <code>{response_send["data"]["pincode"]}</code>\n\nЕсли вы не запрашивали код для входа, проигнорируйте это сообщение.')
                # if not response_tg:
                print(response_tg)
            else:
                raise HTTPException(
                    status_code=422,
                    detail={"error": "no_telegram", "message": "Пользователь не привязал Telegram"}
                )
        elif phone.call_type == 'call':
            response_send = await send_message(phone=phone.phone)
    else:
        response_send = await send_message(phone=phone.phone)
    response_data = response_send['data']
    print("Zvonok API response:", response_send)
    if response_send['status'] == 'error':
        raise HTTPException(status_code=500,
                            detail=f"Zvonok API Error: {response_data}")
    await add_verify_session(call_id=response_data['call_id'], code=response_data['pincode'], phone=phone.phone[1:], session_mysql=session_mysql)
    if response is not None and response is not False and (response or response == 0):
        return CallID(call_id=response_data['call_id'], call_type='auth')
    return CallID(call_id=response_data['call_id'], call_type='register')
    # raise HTTPException(status_code=400,
    #                     detail=f"Phone already registered")


@router.post('/phone/check', response_model=ResponseSchema)
async def check_code(
    data: CheckPhoneCode,
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    response = await get_verify_session(call_id=data.call_id, code=data.code, session_mysql=session_mysql)
    if response:
        await change_verify_status(call_id=data.call_id, code=data.code, session_mysql=session_mysql)
        return ResponseSchema(status_code=200, message="OK")
    return ResponseSchema(status_code=400, message="Error")


@router.post('/phone/change/check', response_model=ResponseSchema)
async def check_phone_change_code(
    data: CheckPhoneCode,
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    response = await get_verify_phone_change_session(call_id=data.call_id, code=data.code, session_mysql=session_mysql)
    if response:
        await change_verify_status(call_id=data.call_id, code=data.code, session_mysql=session_mysql)
        return ResponseSchema(status_code=200, message="OK")
    return ResponseSchema(status_code=400, message="Error")
