from fastapi import APIRouter, Depends
from deps import Authed

router = APIRouter()

@router.get("/me")
def me(user=Depends(Authed)):
    return {"user_id": user["sub"], "email": user.get("email")}
