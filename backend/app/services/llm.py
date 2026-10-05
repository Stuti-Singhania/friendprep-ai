import ollama

MODEL_NAME = "qwen3:1.7b-q4_K_M"


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
- Make the questions suitable for the target role.
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


def evaluate_interview_answer(
    question: str,
    answer: str,
    job_description: str,
) -> str:
    prompt = f"""Evaluate this interview answer briefly.

Question:
{question}

Answer:
{answer}

Job:
{job_description}

Return ONLY:
Score: X/10
Strengths: one short sentence
Missing Concepts: one short sentence
Feedback: one short sentence
Better Answer: 2-3 sentences
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