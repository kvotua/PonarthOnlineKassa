from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse

from app.models.mysql import DiscountCard
from app.schemas.verify_schemas import Phone, CheckPhoneCode
from app.utils import send_message, convert_decimal_to_float
from app.cruds.verify_cruds import add_verify_session, get_verify_session, change_verify_status, check_phone_in_discound
from app.schemas.response_schemas import CallID, ResponseSchema, json_response
from app.databases.postgresdb import get_postgres_session
from app.databases.mysql_db import get_mysql_session


router = APIRouter(prefix='/verify', tags=["Verify"])


@router.post('/phone/send', response_model=CallID)
async def send_code(
    phone: Phone,
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    response = await check_phone_in_discound(phone=phone.phone[1:], session_mysql=session_mysql)
    print(response)
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


@router.post('/phone/check', response_model=ResponseSchema)
async def check_code(
    data: CheckPhoneCode,
    session_mysql: AsyncSession = Depends(get_mysql_session),
):
    response = await get_verify_session(call_id=data.call_id, code=data.code, session_mysql=session_mysql)
    await change_verify_status(call_id=data.call_id, code=data.code, session_mysql=session_mysql)
    return ResponseSchema(status_code=200, message="OK")
