from fastapi import APIRouter
from . import auth

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
# router.include_router(job.router, prefix="/jobs", tags=["jobs"])
# router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
