from fastapi import APIRouter
from . import auth, job, upload

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(job.router, prefix="/jobs", tags=["jobs"])
router.include_router(upload.router, prefix="/uploads", tags=["uploads"])
