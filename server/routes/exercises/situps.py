from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

from deps import Authed
from utils.supabase import sb

router = APIRouter()


class SitupsCreate(BaseModel):
    session_reps: Optional[int] = Field(default=None, ge=0, le=2000)
    session_score: Optional[float] = Field(default=None, ge=0, le=100)

class SitupsPatch(BaseModel):
    session_reps: int = Field(ge=0, le=2000)
    session_score: Optional[float] = Field(default=None, ge=0, le=100)

def _now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()

def _fetch_user_situps(user_id: str):
    res = sb().table("situps").select("*").eq("user_id", user_id).limit(1).execute()
    return res.data[0] if res.data else None

def _insert_situps(user_id: str, history: List[int], score: Optional[float]):
    max_reps = max(history) if history else None
    avg_reps = (sum(history) / len(history)) if history else None
    payload = {
        "user_id": user_id,
        "history": history,
        "max_reps": max_reps,
        "avg_reps": avg_reps,
        "last_tracked": _now_utc() if history else None,
        "score": score,
    }
    res = sb().table("situps").insert(payload).execute()
    if not res.data:
        raise HTTPException(500, "failed to create situps record")
    return res.data[0]

def _update_situps_row(row_id: str, updates: dict):
    res = sb().table("situps").update(updates).eq("id", row_id).execute()
    if not res.data:
        raise HTTPException(404, "situps record not found")
    return res.data[0]


@router.get("")
def get_situps(user=Depends(Authed)):
    """Return the caller's situps record."""
    user_id = user["sub"]
    row = _fetch_user_situps(user_id)
    if not row:
        raise HTTPException(404, "no situps record")
    return row

@router.post("")
def create_situps(body: SitupsCreate, user=Depends(Authed)):
    """
    Create the caller's situps record.
    If it exists, return it.
    Optionally seed with a first session.
    """
    user_id = user["sub"]
    existing = _fetch_user_situps(user_id)
    if existing:
        return existing

    history = []
    score = None
    if body.session_reps is not None:
        history = [int(body.session_reps)]
        score = float(body.session_score) if body.session_score is not None else None

    created = _insert_situps(user_id, history, score)
    return created

@router.patch("")
def patch_situps(body: SitupsPatch, user=Depends(Authed)):
    """
    Append a new situp session, recompute aggregates.
    """
    user_id = user["sub"]
    row = _fetch_user_situps(user_id)
    if not row:
        created = _insert_situps(
            user_id,
            [int(body.session_reps)],
            float(body.session_score) if body.session_score is not None else None,
        )
        return created

    history = list(row.get("history") or [])
    history.append(int(body.session_reps))

    max_reps = max(history)
    avg_reps = sum(history) / len(history)
    updates = {
        "history": history,
        "max_reps": max_reps,
        "avg_reps": avg_reps,
        "last_tracked": _now_utc(),
    }
    if body.session_score is not None:
        updates["score"] = float(body.session_score)

    updated = _update_situps_row(row["id"], updates)
    return updated
