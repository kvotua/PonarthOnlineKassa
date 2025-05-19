from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.models.postgres import Base_postgres
from app.config import postgres_db_url


engine = create_async_engine(
    url=str(postgres_db_url),
    echo=True,
    future=True,
    )

async def create_tables_postgres():
    async with engine.begin() as conn:
        await conn.run_sync(Base_postgres.metadata.create_all)
    await engine.dispose()

async def get_postgres_session():
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