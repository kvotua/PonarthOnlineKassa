from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.models.mysql import Base_mysql
from app.models.postgres import Base_postgres
from app.config import mysql_db_url


#mysql_db_url = "mysql+aiomysql://root:root@127.0.0.1/sql_db?charset=utf8mb4"

engine = create_async_engine(
    url=str(mysql_db_url),
    echo=False,
    future=True,
    )

async def create_tables_mysql():
    async with engine.begin() as conn:
        await conn.run_sync(Base_mysql.metadata.create_all)
    await engine.dispose()

async def get_mysql_session():
    async_session = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )
    async with async_session() as session:
        yield session
        await session.close()