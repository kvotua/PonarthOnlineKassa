from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.postgres import Users
from app.models.mysql import DiscountCard, Verification, UserScore
from app.schemas.users_schemas import RegisterUserLoyaltySystem
from app.schemas.response_schemas import json_response


async def check_phone_status(user_phone: str, session_mysql: AsyncSession) -> DiscountCard:
    try:
        stmt_user = select(DiscountCard).where(DiscountCard.phone == user_phone)
        result_user: Result = await session_mysql.execute(stmt_user)
        user = result_user.scalar_one_or_none()
        if user:
            return user

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
async def add_user(phone: str, session_postgres: AsyncSession) -> Users:
    try:
        user = Users(phone=phone)
        session_postgres.add(user)
        await session_postgres.commit()
        return user
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

async def get_all(session_mysql: AsyncSession):
    stmt = select(UserScore.scores)
    result = await session_mysql.execute(stmt)
    return result.scalars().all()
    
async def add_user_to_loyal_system(data: RegisterUserLoyaltySystem, session_mysql: AsyncSession):
    try:
        stmt_phone = select(Verification).where(Verification.call_id == data.call_id)
        result_phone = await session_mysql.execute(stmt_phone)
        user_phone = result_phone.scalar_one_or_none()       
        if not user_phone:
            return "a"
        if user_phone == 0:
            return "b"
        
        stmt_check_phone = select(DiscountCard).where(DiscountCard.phone == user_phone.phone)
        result_check_phone: Result = await session_mysql.execute(stmt_check_phone)      
        check_phone = result_check_phone.scalar_one_or_none()
        if check_phone:
            stmt_scores = select(UserScore.scores).where(UserScore.card_id == check_phone.id, UserScore.status == 1)
            result_scores: Result = await session_mysql.execute(stmt_scores)
            scores = result_scores.scalars().all()
            return scores
            
        data_user = {
            "first": data.first_name,
            "second": data.last_name,
            "third": data.patronymic,
            "bday": data.birth_date.isoformat(),
            "gender": data.gender,
            "phone": user_phone.phone
        }        
        data_for_discount_card = DiscountCard(
            first=data.first_name,
            second=data.last_name,
            third=data.patronymic,
            gender=data.gender,
            bday=data.birth_date,
            data=data_user,
            phone=user_phone.phone                  
        )               
        session_mysql.add(data_for_discount_card)
        await session_mysql.commit()
        
        return "c"

    except HTTPException as http_e:
        raise http_e
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))