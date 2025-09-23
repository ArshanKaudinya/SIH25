from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

from deps import Authed
from utils.supabase import sb

router = APIRouter()



class PushupsCreate(BaseModel):
    session_reps: Optional[int] = Field(default=None, ge=0, le=1000)
    session_score: Optional[float] = Field(default=None, ge=0, le=100)

class PushupsPatch(BaseModel):
    session_reps: int = Field(ge=0, le=1000)
    session_score: Optional[float] = Field(default=None, ge=0, le=100)


def _now_utc() -> str:
    return datetime.now(timezone.utc).isoformat()

def _fetch_user_pushups(user_id: str):
    res = sb().table("pushups").select("*").eq("user_id", user_id).limit(1).execute()
    return res.data[0] if res.data else None

def _insert_pushups(user_id: str, history: List[int], score: Optional[float]):
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
    res = sb().table("pushups").insert(payload).execute()
    if not res.data:
        raise HTTPException(500, "failed to create pushups record")
    return res.data[0]

def _update_pushups_row(row_id: str, updates: dict):
    res = sb().table("pushups").update(updates).eq("id", row_id).execute()
    if not res.data:
        raise HTTPException(404, "pushups record not found")
    return res.data[0]


@router.get("")
def get_pushups(user=Depends(Authed)):
    """Return the caller's pushups record; 404 if none exists yet."""
    user_id = user["sub"]
    row = _fetch_user_pushups(user_id)
    if not row:
        raise HTTPException(404, "no pushups record")
    return row

@router.post("")
def create_pushups(body: PushupsCreate, user=Depends(Authed)):
    """
    Create the caller's pushups record.
    If it exists, return it (idempotent).
    Optionally seeds with a first session (session_reps, session_score).
    """
    user_id = user["sub"]
    existing = _fetch_user_pushups(user_id)
    if existing:
        return existing

    history = []
    score = None
    if body.session_reps is not None:
        history = [int(body.session_reps)]
        score = float(body.session_score) if body.session_score is not None else None

    created = _insert_pushups(user_id, history, score)
    return created

@router.patch("")
def patch_pushups(body: PushupsPatch, user=Depends(Authed)):
    """
    Append a new session (reps + optional score), recompute aggregates.
    """
    user_id = user["sub"]
    row = _fetch_user_pushups(user_id)
    if not row:
        # If they haven't created a record yet, create it now with the session.
        created = _insert_pushups(user_id, [int(body.session_reps)], float(body.session_score) if body.session_score is not None else None)
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

    updated = _update_pushups_row(row["id"], updates)
    return updated
