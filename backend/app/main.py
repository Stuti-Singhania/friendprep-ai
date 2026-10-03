from fastapi import FastAPI

from app.routes.evaluation import router as evaluation_router
from app.routes.interview import router as interview_router
from app.routes.resume import router as resume_router

app = FastAPI(
    title="FriendPrep AI",
    description="Private AI interview coach powered by open-source AI.",
    version="0.1.0",
)

app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(evaluation_router)


@app.get("/")
def root():
    return {
        "message": "FriendPrep AI API is running!",
        "status": "ok",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}