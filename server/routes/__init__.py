from fastapi import APIRouter
from . import auth, data, deep
from .exercises import pushups, situps

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
# router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
# router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
router.include_router(pushups.router, prefix="/pushups", tags=["pushups"])
router.include_router(situps.router, prefix="/situps", tags=["situps"])
router.include_router(data.router, prefix="/data", tags=["data"])
router.include_router(deep.router, prefix="/deep", tags=["analysis"])
