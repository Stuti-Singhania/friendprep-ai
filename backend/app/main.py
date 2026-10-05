from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.routes.evaluation import router as evaluation_router
from app.routes.interview import router as interview_router
from app.routes.resume import router as resume_router

app = FastAPI(
    title="FriendPrep AI",
    description="Private AI interview coach powered by open-source AI.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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