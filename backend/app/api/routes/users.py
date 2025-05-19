from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession


from app.schemas.users_schemas import ChangeUser, InfoUserLoyaltySystem
from app.api.dependensies import get_access_token
from app.cruds.users_cruds import get_user_loyalty_by_id
from app.databases.postgresdb import get_postgres_session
from app.databases.mysql_db import get_mysql_session


router = APIRouter(tags=["Users"])



@router.get('/profile', response_model=InfoUserLoyaltySystem)
async def get_profile(
    session_mysql: AsyncSession = Depends(get_mysql_session),
    token = Depends(get_access_token) 
):
    user_data = await get_user_loyalty_by_id(user_id=token.get("user_id"), session_mysql=session_mysql)
    return user_data

# @router.patch('/change', response_model=InfoUserLoyaltySystem)
# async def change_user(
#     data: ChangeUser,
#     session: AsyncSession = Depends(get_postgres_session),
#     token = Depends(get_access_token) 
# ):
#     pass