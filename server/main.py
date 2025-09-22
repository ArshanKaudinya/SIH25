from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, pushups

app = FastAPI(title="AiTHLETIQ API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(pushups.router, prefix="/pushups", tags=["pushups"])
# app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
# app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])

@app.get("/health")
def health():
    return {"ok": True}
