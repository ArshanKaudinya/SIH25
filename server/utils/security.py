import json, requests, jwt
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import SUPABASE_JWKS_URL, JWT_AUDIENCE

_bearer = HTTPBearer()
_jwks = None

def _fetch_jwks():
    global _jwks
    if _jwks: return _jwks
    if not SUPABASE_JWKS_URL:
        raise HTTPException(500, "JWKS URL not configured")
    r = requests.get(SUPABASE_JWKS_URL, timeout=5)
    r.raise_for_status()
    _jwks = r.json()
    return _jwks

def get_current_user(creds: HTTPAuthorizationCredentials = Security(_bearer)):
    token = creds.credentials
    try:
        header = jwt.get_unverified_header(token)
        key = next(k for k in _fetch_jwks()["keys"] if k["kid"] == header["kid"])
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
        payload = jwt.decode(token, public_key, algorithms=["RS256"], audience=JWT_AUDIENCE)
        return payload
    except Exception:
        raise HTTPException(401, "Invalid token")
