from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.llm import generate_interview_questions
from pypdf import PdfReader

router = APIRouter(
    prefix="/api/interview",
    tags=["Interview"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/generate-from-resume")
async def generate_from_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    count: int = Form(5),
):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    if len(job_description.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Job description must contain at least 50 characters.",
        )

    if count < 1 or count > 10:
        raise HTTPException(
            status_code=400,
            detail="Question count must be between 1 and 10.",
        )

    file_data = await file.read()

    if not file_data:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(file_data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 5 MB.",
        )

    try:
        reader = PdfReader(BytesIO(file_data))

        resume_text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        ).strip()

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Could not read the PDF file.",
        ) from exc

    if len(resume_text) < 50:
        raise HTTPException(
            status_code=400,
            detail="Could not extract enough readable text from the resume.",
        )

    try:
        questions = generate_interview_questions(
            resume_text=resume_text,
            job_description=job_description,
            count=count,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="The local AI model could not generate the questions.",
        ) from exc

    return {
        "filename": file.filename,
        "pages": len(reader.pages),
        "model": "qwen3:1.7b-q4_K_M",
        "questions": questions,
    }