from pydantic import BaseModel, Field, model_validator
from typing import Annotated

from app.config import example_jwt
from app.utils import validate_phone


class TokenPair(BaseModel):
    access_token: Annotated[str, Field(title="Access token", examples=[example_jwt])]
    refresh_token: Annotated[str, Field(title="Refresh token", examples=[example_jwt])]


class LoginUser(BaseModel):
    phone: Annotated[str, Field(title="The user's phone number", examples=['79211234567'])]

    @model_validator(mode="before")
    def check_phone(cls, values):
        user_phone = values.get('phone')
        if user_phone:
            try:
                valid_phone = validate_phone(user_phone)
                if valid_phone is None:
                    raise ValueError("Invalid phone number")
                else:
                    values["phone"] = valid_phone[1:]
            except:
                return ValueError("Invalid phone number")
            
        return values
    
class RegisterUser(BaseModel):
    phone: Annotated[str, Field(title="The user's phone number", examples=['79211234567'])]
    call_id: Annotated[int, Field(title='The ID received after sending the number', examples=['1191273219673078'])]

    @model_validator(mode="before")
    def check_phone(cls, values):
        user_phone = values.get('phone')
        if user_phone:
            try:
                valid_phone = validate_phone(user_phone)
                if valid_phone is None:
                    raise ValueError("Invalid phone number")
                else:
                    values["phone"] = valid_phone[1:]
            except:
                return ValueError("Invalid phone number")
            
        return values