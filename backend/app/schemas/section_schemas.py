from pydantic import BaseModel


class SectionModel(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True