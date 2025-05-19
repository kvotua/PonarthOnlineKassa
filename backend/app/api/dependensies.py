from fastapi import Request, HTTPException

from app.utils import get_access_token_data, get_new_tokens_pair


def get_access_token(request: Request) -> dict:
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Access token is missing.")
    return get_access_token_data(access_token)

def get_new_tokens(request: Request) -> dict:
    access_token = request.cookies.get("refresh_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Access token is missing.")
    return get_new_tokens_pair(access_token)