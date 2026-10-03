from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from pypdf import PdfReader

router = APIRouter(prefix="/api/resume", tags=["Resume"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
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

        extracted_text = "\n".join(
            page.extract_text() or ""
            for page in reader.pages
        ).strip()

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Could not read the PDF file.",
        ) from exc

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="No readable text was found in the PDF.",
        )

    return {
        "filename": file.filename,
        "pages": len(reader.pages),
        "characters": len(extracted_text),
        "preview": extracted_text[:1000],
    }