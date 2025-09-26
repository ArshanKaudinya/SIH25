from fastapi import APIRouter, HTTPException
from utils.supabase import sb
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def _data(resp):
    return getattr(resp, "data", None)

def _error(resp):
    return getattr(resp, "error", None)

@router.get("/athletes")
def read_athletes():
    resp = sb().table("users").select(
        "id, username, full_name, age, height_cm, weight_kg, coach_id"
    ).execute()

    err = _error(resp)
    if err:
        logger.error("Supabase error (/athletes): %s", err)
        raise HTTPException(status_code=500, detail=f"Supabase error: {err}")

    return _data(resp) or []


@router.get("/athletes/{athlete_id}")
def read_athlete(athlete_id: str):
    resp = (
        sb()
        .table("users")
        .select("id, username, full_name, age, height_cm, weight_kg, coach_id")
        .eq("id", athlete_id)
        .limit(1)
        .execute()
    )

    err = _error(resp)
    if err:
        logger.error("Supabase error (/athletes/%s): %s", athlete_id, err)
        raise HTTPException(status_code=500, detail=f"Supabase error: {err}")

    rows = _data(resp) or []
    if not rows:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return rows[0]


@router.get("/coaches/{coach_id}/athletes")
def read_coach_athletes(coach_id: str):  # <-- str, not 'string'
    resp = (
        sb()
        .table("users")
        .select("id, username, full_name, age, height_cm, weight_kg, coach_id")
        .eq("coach_id", coach_id)
        .execute()
    )

    err = _error(resp)
    if err:
        logger.error("Supabase error (/coaches/%s/athletes): %s", coach_id, err)
        raise HTTPException(status_code=500, detail=f"Supabase error: {err}")

    return _data(resp) or []
