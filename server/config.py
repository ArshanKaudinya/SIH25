# config.py
import os
import logging

try:
    # optional: only if you use a .env file
    from dotenv import load_dotenv  # pip install python-dotenv
    load_dotenv()  # must happen before reading os.getenv
except Exception:
    pass

logger = logging.getLogger(__name__)

def _redact(s: str | None, keep: int = 6) -> str:
    if not s:
        return "<empty>"
    return s[:keep] + "…" + f" (len={len(s)})"

SUPABASE_JWKS_URL = (os.getenv("SUPABASE_JWKS_URL") or "").strip()
SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip()
SUPABASE_SERVICE_ROLE_KEY = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
JWT_AUDIENCE = (os.getenv("JWT_AUDIENCE") or "").strip()

# One-time diagnostics (safe, redacted)
logger.info(
    "Config loaded: SUPABASE_URL=%s, SERVICE_ROLE_KEY=%s",
    _redact(SUPABASE_URL),
    _redact(SUPABASE_SERVICE_ROLE_KEY, keep=3),
)
