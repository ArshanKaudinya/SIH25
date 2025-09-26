from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from utils.deepanalysis import (
    analyze_frames,
    DEFAULT_PROMPT,
    DEFAULT_MODEL,
    _MAX_FRAMES,
)
from utils.supabase import sb

router = APIRouter()


class Exercise(str, Enum):
    pushups = "pushups"
    situps = "situps"


class AnalyzeRequest(BaseModel):
    user_id: str = Field(..., description="UUID of the user")
    exercise: Exercise
    frames: List[str] = Field(..., description="Base64 images or data URLs, earliest → latest")
    prompt: Optional[str] = Field(
        None,
        description="Overrides default coaching prompt; we'll append user context automatically.",
    )
    model: Optional[str] = Field(None, description="Override model, e.g., gpt-4o")
    temperature: Optional[float] = Field(0.2, ge=0, le=2)
    max_output_tokens: Optional[int] = Field(400, ge=1, le=4096)


class AnalyzeResponse(BaseModel):
    result: str
    frames_used: int
    model: str
    context_used: Dict[str, Any]


def _fetch_user_context(user_id: str) -> Dict[str, Any]:
    s = sb()

    # users table
    u = (
        s.table("users")
        .select("id, username, full_name, age, gender, height_cm, weight_kg, coach_id, updated_at, created_at")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    user_row = (u.data or [None])[0]
    if not user_row:
        raise HTTPException(status_code=404, detail="user not found")

    return user_row


def _fetch_exercise_stats(user_id: str, exercise: Exercise) -> Dict[str, Any]:
    s = sb()
    # pick latest row for this user
    q = (
        s.table(exercise.value)
        .select("id, user_id, max_reps, avg_reps, history, last_tracked, score, created_at, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .limit(1)
        .execute()
    )
    row = (q.data or [None])[0]
    return row or {}  # if none exists yet


def _compose_prompt(base_prompt: Optional[str], user_ctx: Dict[str, Any], ex_ctx: Dict[str, Any], exercise: Exercise) -> str:
    # Compact context string
    u = user_ctx or {}
    e = ex_ctx or {}
    hist = e.get("history") or []
    if isinstance(hist, list):
        # take last up to 10 for brevity
        recent_hist = hist[-10:]
    else:
        recent_hist = []

    # human-readable ts
    def _ts(x):
        try:
            return datetime.fromisoformat(x.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M")
        except Exception:
            return str(x) if x else None

    ctx_lines = [
        f"User: {u.get('full_name') or u.get('username') or u.get('id')}",
        f"Age: {u.get('age')}, Gender: {u.get('gender')}",
        f"Height: {u.get('height_cm')} cm, Weight: {u.get('weight_kg')} kg",
        f"Exercise: {exercise.value}",
        f"Max reps: {e.get('max_reps')}, Avg reps: {e.get('avg_reps')}, Score: {e.get('score')}",
        f"Last tracked: {_ts(e.get('last_tracked'))}",
        f"Recent history (most recent last): {recent_hist}",
    ]
    ctx_block = " | ".join([c for c in ctx_lines if c and "None" not in c])

    base = base_prompt or DEFAULT_PROMPT

    final_prompt = (
        f"{base}\n\n"
        f"Context for personalization (use if relevant; do not guess missing data): {ctx_block}.\n"
        "Return 4–6 precise bullets. If camera angle/lighting blocks assessment, say what to adjust. "
        "No training loads, no medical claims."
    )
    return final_prompt


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(body: AnalyzeRequest):
    try:
        user_ctx = _fetch_user_context(body.user_id)
        ex_ctx = _fetch_exercise_stats(body.user_id, body.exercise)

        combined_prompt = _compose_prompt(body.prompt, user_ctx, ex_ctx, body.exercise)

        text = analyze_frames(
            frames_base64=body.frames,
            prompt=combined_prompt,
            model=body.model or DEFAULT_MODEL,
            max_output_tokens=body.max_output_tokens or 800,
            temperature=body.temperature if body.temperature is not None else 0.2,
        )
        return AnalyzeResponse(
            result=text,
            frames_used=min(len(body.frames), _MAX_FRAMES),
            model=body.model or DEFAULT_MODEL,
            context_used={"user": user_ctx, "exercise": ex_ctx},
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
