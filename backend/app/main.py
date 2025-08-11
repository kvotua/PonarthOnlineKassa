from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from app.api.main import api_router
from app.databases.postgresdb import create_tables_postgres
from app.databases.mysql_db import create_tables_mysql
from app.schemas.response_schemas import json_response
from app.utils import get_http_client, close_http_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Инициализация подключений и клиентов при старте
    # await get_http_client()  # Инициализируем HTTP клиент
    
    # await create_tables_postgres()
    # await create_tables_mysql()
    
    yield
    
    # Очистка при завершении
    await close_http_client()

app = FastAPI(
    lifespan=lifespan,
    title="LOYALITY API",
    description="API description",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def custom_validation_exception_handler(request: Request, exc: RequestValidationError):
    try:
        error_msg = exc.errors()[0]['msg']
    except:
        error_msg = "Invalid input"
    if error_msg.startswith("Value error, "):
        error_msg = error_msg.replace("Value error, ", "", 1)
    return json_response(
        status_code=422,
        message=error_msg
    )

app.include_router(api_router)