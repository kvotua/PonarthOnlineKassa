import hmac
import re
from typing import Annotated
from fastapi import APIRouter, HTTPException, Depends, Query, Request, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, date

from app.schemas.users_schemas import RegisterFioUserLoyaltySystem, RegisterUserLoyaltySystem
from app.schemas.auth_schemas import TokenPair, LoginUser, RegisterUser
from app.schemas.response_schemas import CallID, ResponseSchema, json_response
from app.schemas.verify_schemas import Phone
from app.cruds import auth_cruds
from app.cruds.auth_cruds import check_phone_status, add_user_to_loyal_system, get_all
from app.cruds.verify_cruds import add_verify_session, check_phone_in_discound, get_verify_session, get_verify_session_without_code
from app.utils import get_access_token_data, get_current_user, send_message, sing_access_jwt_token, sing_refresh_jwt_token, convert_decimal_to_float
from app.api.dependensies import get_new_tokens, get_access_token
from app.databases.postgresdb import get_postgres_session
from app.databases.mysql_db import get_mysql_session

from app.config import bot_token_hash


router = APIRouter(tags=["Auth"])

@router.get("/check-token")
async def check_token(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    try:
        get_access_token_data(token)
        return {"valid": True}
    except HTTPException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

@router.get("/")
async def get(session_mysql: AsyncSession = Depends(get_mysql_session),):
    data = await get_all(session_mysql=session_mysql)
    return sum(data)

# @router.get("/profile")
# async def get_profile(user_data=Depends(get_current_user_from_cookie)):
#     phone = user_data['phone']
#     response = await check_phone_in_discound(phone=phone.phone, session_mysql=session_mysql)
#     print(response)
#     scores = convert_decimal_to_float(response)
#     if isinstance(scores, (int, float)):
#         scores = [scores]
#     total_score = sum(scores) if scores else 0

#     stmt = select(DiscountCard).where(DiscountCard.phone == phone.phone[1:])
#     result = await session_mysql.execute(stmt)
#     user = result.scalars().first()
#     response_data = {
#         "status_code": 400,
#         "message": "User is already registered",
#         "scores": total_score,
#     }
#     if user:
#         response_data.update({
#                 "date_added": user.date_added.isoformat() if user.date_added else None,
#                 "first": user.first,
#                 "third": user.third,
#         })
#         return JSONResponse(status_code=200, content=response_data)


# @router.get('/telegram-callback')
# async def telegram_callback(
#         response: Response,
#         request: Request,
#         user_id: Annotated[int, Query(alias='id')],
#         query_hash: Annotated[str, Query(alias='hash')],
#         session_mysql: AsyncSession = Depends(get_mysql_session),
# ):
#     params = request.query_params.items()
#     data_check_string = '\n'.join(sorted(f'{x}={y}' for x, y in params if x not in ('hash', 'next')))
#     computed_hash = hmac.new(bot_token_hash.digest(), data_check_string.encode(), 'sha256').hexdigest()
#     is_correct = hmac.compare_digest(computed_hash, query_hash)
#     if not is_correct:
#         return ResponseSchema(status_code=401, message='Authorization failed. Please try again')
    
#     user = await auth_cruds.get_user_by_telegram_user_id(user_id=user_id, session_mysql=session_mysql)

#     if user:
#         access_token = sing_access_jwt_token(user_id=user.id, phone=user.phone)
#         refresh_token = sing_refresh_jwt_token(user_id=user.id, phone=user.phone)
#         response = JSONResponse(status_code=200, content={
#             "access_token": access_token,
#             "refresh_token": refresh_token
#         })
#         return response
#     return ResponseSchema(status_code=404, message='User not found')

@router.post('/login', response_model=TokenPair)
async def login_user(
    response: Response,
    data: LoginUser,
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    print('data:')
    print(f'- phone: {data.phone}')
    print(f'- call_id: {data.call_id}')
    print(f'- code: {data.code}')
    user = await check_phone_status(user_phone=data.phone, session_mysql=session_mysql)
    print(f'user: {str(user)}')
    if user:
        print(f'user phone (db): {str(user.phone)}')
        print(f'user phone (request): {str(data.phone)}')
        response_verify = await get_verify_session(call_id=data.call_id, code=data.code, session_mysql=session_mysql)
        if response_verify:
            print(f'response_verify code: {response_verify.code}')
            access_token = sing_access_jwt_token(user_id=user.user_id, phone=user.phone)
            refresh_token = sing_refresh_jwt_token(user_id=user.user_id, phone=user.phone)
            response.set_cookie(key="access_token", value=access_token, httponly=True)
            response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
            return {
                "access_token": access_token,
                "refresh_token": refresh_token
            }
        else:
            raise HTTPException(status_code=404, detail="Call ID not found or incorrect code")
    raise HTTPException(status_code=404, detail="User not found")

# @router.post('/phone/send', response_model=CallID)
# async def send_code(
#     phone: Phone,
#     session_mysql: AsyncSession = Depends(get_mysql_session),
# ):
#     response = await check_phone_in_discound(phone=phone.phone, session_mysql=session_mysql)
#     if response is not None and response is not False and (response or response == 0):
#         response_send = await send_message(phone=phone.phone)
#         response_data = response_send['data']
#         print("Zvonok API response:", response_send)
#         if response_send['status'] == 'error':
#             raise HTTPException(status_code=500,
#                                 detail=f"Zvonok API Error: {response_data}")
#         await add_verify_session(call_id=response_data['call_id'], code=response_data['pincode'], phone=phone.phone[1:], session_mysql=session_mysql)
#         return CallID(call_id=response_data['call_id'])
#     raise HTTPException(status_code=404, detail="User not found")

# @router.post('/register', response_model=TokenPair)
# async def register_user(   
#     data: RegisterUser,
#     session_mysql: AsyncSession = Depends(get_mysql_session),
#     session_postgres: AsyncSession = Depends(get_postgres_session),
# ):
#     user = await check_phone_status(user_phone=data.phone, session_mysql=session_mysql)
#     if user:
#         raise HTTPException(status_code=400, detail="The phone number has already been registered")
#     verify_info = await get_verify_session_without_code(call_id=data.call_id, phone=data.phone, session_postgres=session_postgres)
#     if not verify_info.verified:
#         raise HTTPException(status_code=403, detail="The phone number not verifed")
#     user = await add_user(phone=data.phone, session_postgres=session_postgres)
#     access_token = sing_access_jwt_token(user_id=user.id, phone=user.phone)
#     refresh_token = sing_refresh_jwt_token(user_id=user.id, phone=user.phone)
#     response = JSONResponse(status_code=200, content={
#         "access_token": access_token,
#         "refresh_token": refresh_token
#     })
#     response.set_cookie(key="access_token", value=access_token, httponly=True)
#     response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
#     return response


# @router.post('/logout')
# async def logout_user(
#     token = Depends(get_access_token)
# ):
#     response = JSONResponse(status_code=200, content={"message": "Succsessful logout."})
#     response.delete_cookie(key="access_token", httponly=True)
#     response.delete_cookie(key="refresh_token", httponly=True)
#     return response
    

@router.post('/register-discount')
async def register_user(
    response: Response,
    data: RegisterFioUserLoyaltySystem,
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    user_birth_date = data.birth_date.strftime("%Y-%m-%d")
    birth_date = datetime.strptime(user_birth_date, "%Y-%m-%d").date()
    
    if user_birth_date:
        today = date.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        if age < 18:
            return json_response(status_code=422, message="User must be at least 18 years old.")
        
    
    fio = data.full_name.strip()
    fio_parts = fio.split()

    if len(fio_parts) < 2 or len(fio_parts) > 3:
        return json_response(status_code=422, message="Full name must contain 2 or 3 words.")

    for part in fio_parts:
        if not re.fullmatch(r"[А-Яа-яЁё]{2,}", part):
            return json_response(
                status_code=422,
                message="Each part of the full name must contain at least 2 Russian letters.",
            )

    fio_parts = [
        part.capitalize() if part else ""
        for part in fio_parts
    ]

    last_name = fio_parts[0]
    first_name = fio_parts[1]
    patronymic = fio_parts[2] if len(fio_parts) == 3 else None

    prepared_user = RegisterUserLoyaltySystem(
        last_name=last_name,
        first_name=first_name,
        patronymic=patronymic,
        birth_date=data.birth_date,
        gender=data.gender,
        call_id=data.call_id,
        referal_discount_card_id=data.referal_discount_card_id,
    )
    
    result = await add_user_to_loyal_system(data=prepared_user, session_mysql=session_mysql)
    
    if result == "a":
        return json_response(status_code=404, message="Phone by call id not found")
    if result == "b":
        return json_response(status_code=403, message="Phone not verified")
    if result == "c":
        return json_response(status_code=400, message="Phone number already registered")
    
    user = await check_phone_status(user_phone=result, session_mysql=session_mysql)
    if user:
        access_token = sing_access_jwt_token(user_id=user.user_id, phone=user.phone)
        refresh_token = sing_refresh_jwt_token(user_id=user.user_id, phone=user.phone)
        response.set_cookie(key="access_token", value=access_token, httponly=True)
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token
        }
    return json_response(status_code=400, message="Phone number already registered")

# @router.post('/refresh-jwt', response_model=TokenPair)
# async def get_new_tokens_pair(
#     token_pair = Depends(get_new_tokens)
# ):  
#     response = JSONResponse(status_code=200, content=token_pair)
#     response.set_cookie(key="access_token", value=token_pair.get("access_token"), httponly=True)
#     response.set_cookie(key="refresh_token", value=token_pair.get("refresh_token"), httponly=True)
#     return response