import jwt
import phonenumbers
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from decimal import Decimal
from app.config import secret_key, algorithm, expire_minutes, expire_days, public_key, campaign_id

import aiohttp

session: aiohttp.ClientSession | None = None

async def startup_event():
    global session
    session = aiohttp.ClientSession()

async def shutdown_event():
    global session
    if session:
        await session.close()

async def send_message(phone: str, public_key: str, campaign_id: str):
    global session
    if not session:
        raise RuntimeError("ClientSession не инициализирована")

    url = "https://example.com/send"
    payload = {
        'public_key': public_key,
        'phone': phone,
        'campaign_id': campaign_id
    }

    async with session.post(url, data=payload) as resp:
        return await resp.json()

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
    expire = datetime.now(timezone.utc) + \
        timedelta(minutes=int(expire_minutes))
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
    expire = datetime.now(timezone.utc) + timedelta(days=int(expire_days))
    payload.update({"exp": expire, "type": "refresh"})
    return jwt.encode(payload=payload, key=secret_key, algorithm=algorithm)


def get_access_token_data(
        token: str,
        secret_key=secret_key,
        algorithm=algorithm) -> dict:
    try:
        decoded = jwt.decode(token, key=secret_key, algorithms=[algorithm])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    now_ts = int(datetime.now(timezone.utc).timestamp())

    if decoded.get("exp") is None or decoded.get("exp") <= now_ts:
        raise HTTPException(status_code=401, detail="Expired token.")

    if decoded.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type.")

    return decoded


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