import logging
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

logger = logging.getLogger(__name__)

_sb: Client | None = None

def sb() -> Client:
    """
    Return a singleton Supabase client. Logs and raises on error.
    """
    global _sb
    if _sb is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            logger.error("Supabase configuration missing. URL or key not provided.")
            raise RuntimeError("Supabase not configured (missing URL or key)")

        try:
            _sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.exception("Failed to create Supabase client")
            raise
    return _sb
