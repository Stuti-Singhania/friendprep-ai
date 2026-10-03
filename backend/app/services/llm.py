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


def evaluate_interview_answer(
    question: str,
    answer: str,
    resume_text: str,
    job_description: str,
) -> str:
    prompt = f"""
You are an interview evaluator.

Evaluate the candidate's answer to the interview question.

Question:
{question}

Candidate Answer:
{answer}

Candidate Resume:
{resume_text}

Job Description:
{job_description}

Evaluate the answer on:
1. Technical correctness
2. Completeness
3. Clarity
4. Relevance

Return your evaluation in this exact structure:

Score: <number out of 10>

Strengths:
- <strength 1>
- <strength 2>

Missing Concepts:
- <concept 1>
- <concept 2>

Feedback:
<short constructive feedback>

Better Answer:
<concise example of a stronger answer>
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