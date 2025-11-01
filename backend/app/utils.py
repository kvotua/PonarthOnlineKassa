from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
import phonenumbers
from datetime import datetime, timezone, timedelta
from fastapi import Depends, HTTPException, Request, status
from decimal import Decimal
from app.config import secret_key, algorithm, expire_access_days, expire_refresh_days, public_key, campaign_id, debug_mode

import aiohttp
import random
import time

random.seed(time.time())

security = HTTPBearer()

session: aiohttp.ClientSession | None = None

async def startup_event():
    global session
    session = aiohttp.ClientSession()

async def shutdown_event():
    global session
    if session:
        await session.close()

async def send_message(phone: str):
    global session
    if not session:
        raise RuntimeError("ClientSession не инициализирована")
    
    if debug_mode == 0:
        url = "https://zvonok.com/manager/cabapi_external/api/v1/phones/flashcall/"
        payload = {
            'public_key': public_key,
            'phone': phone,
            'campaign_id': campaign_id
        }

        async with session.post(url, data=payload) as resp:
            return await resp.json()
    else:
        return {
            'status': 'done',
            'data': {
                'pincode': '1234',
                'call_id': random.randint(99999, 999999999)
            }
        }

def validate_phone(phone):
    valid = phonenumbers.parse(phone, 'RU')
    if phonenumbers.is_valid_number(valid):
        valid_phone = ''
        for i in phonenumbers.format_number(
                valid, phonenumbers.PhoneNumberFormat.NATIONAL):
            if i.isdigit():
                valid_phone += i
        return valid_phone


def sing_access_jwt_token(
        user_id: int,
        phone: str,
        secret_key=secret_key,
        algorithm=algorithm):
    payload = {
        "user_id": user_id,
        "phone": phone,
    }
    expire = datetime.now(timezone.utc) + timedelta(days=int(expire_access_days))
    payload.update({"exp": expire, "type": "access"})
    return jwt.encode(payload=payload, key=secret_key, algorithm=algorithm)


def sing_refresh_jwt_token(
        user_id: int,
        phone: str,
        secret_key=secret_key,
        algorithm=algorithm):
    payload = {
        "user_id": user_id,
        "phone": phone,
    }
    expire = datetime.now(timezone.utc) + timedelta(days=int(expire_refresh_days))
    payload.update({"exp": expire, "type": "refresh"})
    return jwt.encode(payload=payload, key=secret_key, algorithm=algorithm)


def get_access_token_data(
        token: str,
        secret_key=secret_key,
        algorithm=algorithm) -> dict:
    try:
        decoded = jwt.decode(token, key=secret_key, algorithms=[algorithm])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    now_ts = int(datetime.now(timezone.utc).timestamp())

    if decoded.get("exp") is None or decoded.get("exp") <= now_ts:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    if decoded.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type.")

    return decoded

async def get_current_user_with_bearer(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials  # сам токен
    from app.utils import get_access_token_data

    try:
        user_data = get_access_token_data(token)
    except HTTPException as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=e.detail)
    return user_data

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.split(" ")[1]

    try:
        payload = get_access_token_data(token)
    except HTTPException as e:
        raise HTTPException(status_code=401, detail=e.detail)

    return payload

def get_new_tokens_pair(refresh_token: str) -> dict:
    try:
        decoded: dict = jwt.decode(
            refresh_token,
            key=secret_key,
            algorithms=[algorithm])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    now_ts = int(datetime.now(timezone.utc).timestamp())

    if decoded.get("exp") is None or decoded.get("exp") <= now_ts:
        raise HTTPException(status_code=401, detail="Expired token.")

    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type.")

    new_access_token = sing_access_jwt_token(
        user_id=decoded.get("user_id"),
        phone=decoded.get("phone"))
    new_refresh_token = sing_refresh_jwt_token(
        user_id=decoded.get("user_id"),
        phone=decoded.get("phone"))
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }


def convert_decimal_to_float(data):
    if isinstance(data, list):
        return [convert_decimal_to_float(item) for item in data]
    elif isinstance(data, dict):
        return {key: convert_decimal_to_float(
            value) for key, value in data.items()}
    elif isinstance(data, Decimal):
        return float(data)
    return data
    """Рекурсивное преобразование Decimal в float"""
    if isinstance(data, list):
        return [convert_decimal_to_float(item) for item in data]
    if isinstance(data, dict):
        return {key: convert_decimal_to_float(value) for key, value in data.items()}
    if isinstance(data, Decimal):
        return float(data)
    return data