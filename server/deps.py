from fastapi import Depends
from utils.security import get_current_user

def Authed(user=Depends(get_current_user)):
    return user
