from pydantic import BaseModel, Field
from typing import Annotated, Any, Optional
from fastapi.responses import JSONResponse


class ResponseSchema(BaseModel):
    status_code: Annotated[int, Field(title="Status code", examples=[200])]
    message: Annotated[Any, Field(title="Response message", examples=["OK"])]


class ResponseSchemaWithScores(BaseModel):
    status_code: Annotated[int, Field(title="Status code", examples=[200])]
    message: Annotated[Any, Field(title="Response message", examples=["OK"])]
    scores: Annotated[Optional[Any], Field(title="Count scores", examples=[2.53], default=None)]


class CallID(BaseModel):
    call_id: Annotated[int, Field(title='The ID received after getting the call', examples=['1191273219673078'])]

def json_response(status_code: int, message: any, scores: any = None) -> JSONResponse:
    if scores:
        return JSONResponse(
        status_code=status_code,
        content=ResponseSchemaWithScores(status_code=status_code, message=message, scores=scores).dict(),        
    )
    return JSONResponse(
        status_code=status_code,
        content=ResponseSchema(status_code=status_code, message=message).dict()
    )
