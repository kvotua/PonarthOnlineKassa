import phonenumbers
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
import jwt
from aiohttp import ClientSession, TCPConnector, ClientTimeout
import asyncio
from decimal import Decimal
from typing import Optional
import socket
from app.config import secret_key, algorithm, expire_minutes, expire_days, public_key, campaign_id

class SimpleResolver:
    """Кастомный резолвер без использования aiodns/pycares"""
    async def resolve(self, host, port=0, family=0):
        return await asyncio.get_event_loop().getaddrinfo(
            host, port, type=socket.SOCK_STREAM, family=family
        )

    async def close(self):
        pass

class HttpClient:
    _instance: Optional['HttpClient'] = None
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(
        self,
        url: str,
        public_key: str = public_key,
        campaign_id: str = campaign_id
    ):
        if self._initialized:
            return
            
        self.url = url
        self.public_key = public_key
        self.campaign_id = campaign_id
        
        # Используем кастомный резолвер
        self.connector = TCPConnector(
            resolver=SimpleResolver(),  # Наш собственный резолвер
            limit=10,
            limit_per_host=3,
            enable_cleanup_closed=True,
            force_close=False
        )
        
        # Таймауты для всех операций
        timeout = ClientTimeout(
            total=30,
            connect=10,
            sock_connect=10,
            sock_read=10
        )
        
        self.session = ClientSession(
            connector=self.connector,
            timeout=timeout,
            trust_env=True
        )
        
        self._initialized = True

    async def close(self):
        """Асинхронное закрытие сессии"""
        if hasattr(self, "session"):
            await self.session.close()

# Инициализация клиента в event loop
async def init_http_client():
    global http_client
    http_client = HttpClient(
        url='https://zvonok.com/manager/cabapi_external/api/v1/phones/flashcall/'
    )

# Запускаем при старте приложения
asyncio.get_event_loop().run_until_complete(init_http_client())

def validate_phone(phone: str) -> Optional[str]:
    """Валидация номера телефона для РФ"""
    try:
        valid = phonenumbers.parse(phone, 'RU')
        if phonenumbers.is_valid_number(valid):
            return ''.join(
                c for c in phonenumbers.format_number(
                    valid, 
                    phonenumbers.PhoneNumberFormat.NATIONAL
                ) if c.isdigit()
            )
    except phonenumbers.phonenumberutil.NumberParseException:
        return None
    return None

def sing_access_jwt_token(
        user_id: int,
        phone: str,
        secret_key: str = secret_key,
        algorithm: str = algorithm) -> str:
    """Генерация JWT токена доступа"""
    payload = {
        "user_id": user_id,
        "phone": phone,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=int(expire_minutes)),
        "type": "access"
    }
    return jwt.encode(payload, key=secret_key, algorithm=algorithm)

def sing_refresh_jwt_token(
        user_id: int,
        phone: str,
        secret_key: str = secret_key,
        algorithm: str = algorithm) -> str:
    """Генерация JWT refresh токена"""
    payload = {
        "user_id": user_id,
        "phone": phone,
        "exp": datetime.now(timezone.utc) + timedelta(days=int(expire_days)),
        "type": "refresh"
    }
    return jwt.encode(payload, key=secret_key, algorithm=algorithm)

def get_access_token_data(
        token: str,
        secret_key: str = secret_key,
        algorithm: str = algorithm) -> dict:
    """Валидация и декодирование access токена"""
    try:
        decoded = jwt.decode(token, key=secret_key, algorithms=[algorithm])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    now = datetime.now(timezone.utc).timestamp()
    if decoded.get("exp", 0) <= now:
        raise HTTPException(status_code=401, detail="Token expired")
    if decoded.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    return decoded

def get_new_tokens_pair(refresh_token: str) -> dict:
    """Обновление пары токенов"""
    try:
        decoded = jwt.decode(
            refresh_token,
            key=secret_key,
            algorithms=[algorithm]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    now = datetime.now(timezone.utc).timestamp()
    if decoded.get("exp", 0) <= now:
        raise HTTPException(status_code=401, detail="Token expired")
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    return {
        "access_token": sing_access_jwt_token(
            user_id=decoded["user_id"],
            phone=decoded["phone"]
        ),
        "refresh_token": sing_refresh_jwt_token(
            user_id=decoded["user_id"],
            phone=decoded["phone"]
        )
    }

def convert_decimal_to_float(data):
    """Рекурсивное преобразование Decimal в float"""
    if isinstance(data, list):
        return [convert_decimal_to_float(item) for item in data]
    if isinstance(data, dict):
        return {key: convert_decimal_to_float(value) for key, value in data.items()}
    if isinstance(data, Decimal):
        return float(data)
    return data