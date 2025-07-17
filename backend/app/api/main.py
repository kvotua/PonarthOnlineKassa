from fastapi import APIRouter

from app.api.routes import cart, products, users, auth, verify, good

api_router = APIRouter(prefix='/api/v1')

api_router.include_router(auth.router)
api_router.include_router(verify.router)
# api_router.include_router(users.router)
# api_router.include_router(products.router)
# api_router.include_router(cart.router)

api_router.include_router(good.router)