from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, date

from app.schemas.users_schemas import RegisterUserLoyaltySystem
from app.schemas.auth_schemas import TokenPair, LoginUser, RegisterUser
from app.schemas.response_schemas import json_response
from app.cruds.auth_cruds import check_phone_status, add_user_to_loyal_system, add_user, get_all
from app.cruds.verify_cruds import get_verify_session_without_code
from app.utils import sing_access_jwt_token, sing_refresh_jwt_token, convert_decimal_to_float
from app.api.dependensies import get_new_tokens, get_access_token
from app.databases.postgresdb import get_postgres_session
from app.databases.mysql_db import get_mysql_session


router = APIRouter(tags=["Auth"])

@router.get("/")
async def get(session_mysql: AsyncSession = Depends(get_mysql_session),):
    data = await get_all(session_mysql=session_mysql)
    return sum(data)


# @router.post('/login', response_model=TokenPair)
# async def login_user(
#     data: LoginUser,
#     session_mysql: AsyncSession = Depends(get_mysql_session),
# ):
#     user = await check_phone_status(user_phone=data.phone, session_mysql=session_mysql)
#     if user:
#         access_token = sing_access_jwt_token(user_id=user.user_id, phone=user.phone)
#         refresh_token = sing_refresh_jwt_token(user_id=user.user_id, phone=user.phone)
#         response = JSONResponse(status_code=200, content={
#             "access_token": access_token,
#             "refresh_token": refresh_token
#         })
#         response.set_cookie(key="access_token", value=access_token, httponly=True)
#         response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
#         return response
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
    data: RegisterUserLoyaltySystem,
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    user_birth_date = data.birth_date.strftime("%Y-%m-%d")
    birth_date = datetime.strptime(user_birth_date, "%Y-%m-%d").date()
    
    if user_birth_date:
        today = date.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        if age < 18:
            return json_response(status_code=422, message="User must be at least 18 years old.")
    
    discount_cart = await add_user_to_loyal_system(data=data, session_mysql=session_mysql)
    
    if discount_cart == "a":
        return json_response(status_code=404, message="Phone by call id not found")
    if discount_cart == "b":
        return json_response(status_code=403, message="Phone not verified")
    if discount_cart == "c":
        return json_response(status_code=200, message="Successfully added.")

    scores = convert_decimal_to_float(discount_cart)
    
    return json_response(status_code=400, message="Phone number already registered", scores=sum(scores))
    



# @router.post('/refresh-jwt', response_model=TokenPair)
# async def get_new_tokens_pair(
#     token_pair = Depends(get_new_tokens)
# ):  
#     response = JSONResponse(status_code=200, content=token_pair)
#     response.set_cookie(key="access_token", value=token_pair.get("access_token"), httponly=True)
#     response.set_cookie(key="refresh_token", value=token_pair.get("refresh_token"), httponly=True)
#     return response