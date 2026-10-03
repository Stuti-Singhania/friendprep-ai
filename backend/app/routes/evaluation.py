from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.llm import evaluate_interview_answer

router = APIRouter(
    prefix="/api/evaluation",
    tags=["Evaluation"],
)


class EvaluationRequest(BaseModel):
    question: str = Field(min_length=10)
    answer: str = Field(min_length=10)
    resume_text: str = Field(min_length=50)
    job_description: str = Field(min_length=50)


@router.post("/evaluate")
def evaluate_answer(request: EvaluationRequest):
    evaluation = evaluate_interview_answer(
        question=request.question,
        answer=request.answer,
        resume_text=request.resume_text,
        job_description=request.job_description,
    )

    return {
        "model": "qwen3:4b",
        "evaluation": evaluation,
    }