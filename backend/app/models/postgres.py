from sqlalchemy import BigInteger, Text, func, VARCHAR, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime


Base_postgres = declarative_base()


class Users(Base_postgres):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    phone: Mapped[str] = mapped_column(VARCHAR(10), nullable=False)


class Verification(Base_postgres):
    __tablename__ = 'verification'

    call_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    code: Mapped[str] = mapped_column(VARCHAR(4))
    phone: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    verified: Mapped[bool] = mapped_column(Boolean, default=False)