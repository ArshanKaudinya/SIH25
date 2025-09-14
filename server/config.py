import os

SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL", "").strip()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

STORAGE_KIND = os.getenv("STORAGE_KIND", "r2")  # r2|s3 (default r2)

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "").strip()
R2_BUCKET = os.getenv("R2_BUCKET", "").strip()
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY", "").strip()
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY", "").strip()
PRESIGN_TTL = int(os.getenv("PRESIGN_TTL", "900"))  # seconds
