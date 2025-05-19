from pydantic import BaseModel, Field, model_validator
from typing import Annotated

from app.utils import validate_phone


class Phone(BaseModel):
    phone: Annotated[str, Field(title="Phone number", examples=['+79632928738'])]

    @model_validator(mode="before")
    def validate_phone(cls, values):
        phone = values.get('phone')
        if phone:
            try:
                valid_phone = validate_phone(phone)
                if valid_phone is None:
                    raise ValueError("Invalid phone number")
                else:
                    values["phone"] = valid_phone
            except:
                raise ValueError("Invalid phone number")
        return values


class CheckPhoneCode(BaseModel):
    phone: Annotated[str, Field(title="Phone number", examples=['+79632928738'])]
    call_id: Annotated[int, Field(title='The ID received after sending the number', examples=['1191273219673078'])]
    code: Annotated[str, Field(title='The code sent by the call to the number', examples=['1234'], min_length=4, max_length=4)]
    
    @model_validator(mode="before")
    def validate_phone(cls, values):
        phone = values.get('phone')
        if phone:
            try:
                valid_phone = validate_phone(phone)
                if valid_phone is None:
                    raise ValueError("Invalid phone number")
                else:
                    values["phone"] = valid_phone
            except:
                raise ValueError("Invalid phone number")
        return values