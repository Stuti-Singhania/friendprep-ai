import ollama

MODEL_NAME = "qwen3:4b"


def generate_interview_questions(
    resume_text: str,
    job_description: str,
    count: int = 5,
) -> str:
    prompt = f"""
You are an interview preparation assistant.

Create {count} technical interview questions personalized to the candidate.

Candidate Resume:
{resume_text}

Job Description:
{job_description}

Requirements:
- Focus on skills and technologies mentioned in the resume and job description.
- Mix conceptual and practical questions.
- Do not invent experience that is not present in the resume.
- Return only the interview questions as a numbered list.
"""

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return response["message"]["content"]