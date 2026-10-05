"use client";

import {
  ChangeEvent,
  FormEvent,
  useMemo,
  useState,
} from "react";

const API_URL = "http://localhost:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  const [mockInterview, setMockInterview] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");

  // Convert Qwen's numbered response into individual questions.
  const questionList = useMemo(() => {
    return questions
      .split(/\n(?=\s*\d+\.\s)/)
      .map((question) => question.replace(/^\s*\d+\.\s*/, "").trim())
      .filter(Boolean);
  }, [questions]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (selectedFile && selectedFile.type !== "application/pdf") {
      setFile(null);
      setError("Please select a PDF resume.");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const generateQuestions = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!file) {
      setError("Please upload your resume PDF.");
      return;
    }

    if (jobDescription.trim().length < 50) {
      setError(
        "Please enter a job description of at least 50 characters."
      );
      return;
    }

    setLoading(true);
    setError("");
    setQuestions("");
    setEvaluation("");
    setMockInterview(false);
    setAnswer("");
    setCurrentQuestionIndex(0);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "job_description",
        jobDescription
      );
      formData.append("count", "5");

      const response = await fetch(
        `${API_URL}/api/interview/generate-from-resume`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to generate interview questions."
        );
      }

      setQuestions(data.questions);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const startMockInterview = () => {
    if (questionList.length === 0) {
      setError(
        "No questions are available. Generate questions first."
      );
      return;
    }

    setMockInterview(true);
    setCurrentQuestionIndex(0);
    setAnswer("");
    setEvaluation("");
    setError("");
  };

  const submitAnswer = async () => {
    if (answer.trim().length < 10) {
      setError(
        "Please write a more detailed answer before submitting."
      );
      return;
    }

    setEvaluating(true);
    setError("");
    setEvaluation("");

    try {
      const response = await fetch(
        `${API_URL}/api/evaluation/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question:
              questionList[currentQuestionIndex],
            answer: answer.trim(),
            job_description: jobDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to evaluate the answer."
        );
      }

      setEvaluation(data.evaluation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while evaluating your answer."
      );
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(
      (index) => index + 1
    );
    setAnswer("");
    setEvaluation("");
    setError("");
  };

  const backToQuestions = () => {
    setMockInterview(false);
    setAnswer("");
    setEvaluation("");
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">

        {/* Header */}
        <section className="text-center">
          <div className="mb-4 inline-block rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
            Powered by local open-weight AI
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            FriendPrep AI
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Your private AI interview coach for
            personalized technical interview
            preparation.
          </p>
        </section>

        {/* ========================= */}
        {/* QUESTION GENERATION SCREEN */}
        {/* ========================= */}

        {!mockInterview && (
          <>
            <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

              <form
                onSubmit={generateQuestions}
                className="space-y-7"
              >
                {/* Resume */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Upload your resume
                  </label>

                  <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 p-8 transition hover:border-slate-500">
                    <div className="text-center">
                      <div className="text-3xl">
                        📄
                      </div>

                      <p className="mt-3 text-sm font-medium">
                        {file
                          ? file.name
                          : "Choose your resume PDF"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        PDF files up to 5 MB
                      </p>
                    </div>

                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Job Description */}
                <div>
                  <label
                    htmlFor="job-description"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Job description
                  </label>

                  <textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(event) =>
                      setJobDescription(
                        event.target.value
                      )
                    }
                    placeholder="Paste the job description here..."
                    rows={9}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* Generate */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Generating personalized questions..."
                    : "Generate Interview Questions"}
                </button>
              </form>
            </section>

            {/* Questions */}
            {questions && (
              <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8">

                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-500">
                    AI-generated practice
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Your Personalized Questions
                  </h2>
                </div>

                <div className="space-y-4">
                  {questionList.map(
                    (question, index) => (
                      <div
                        key={index}
                        className="rounded-xl bg-slate-950 p-5"
                      >
                        <p className="text-sm font-medium text-slate-500">
                          Question {index + 1}
                        </p>

                        <p className="mt-2 leading-7 text-slate-300">
                          {question}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <button
                  onClick={startMockInterview}
                  className="mt-6 w-full rounded-xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Start Mock Interview
                </button>
              </section>
            )}
          </>
        )}

        {/* ========================= */}
        {/* MOCK INTERVIEW SCREEN */}
        {/* ========================= */}

        {mockInterview &&
          questionList.length > 0 && (
            <section className="mx-auto mt-12 max-w-3xl">

              {/* Progress */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Mock Interview
                </p>

                <p className="text-sm text-slate-500">
                  Question{" "}
                  {currentQuestionIndex + 1} of{" "}
                  {questionList.length}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-white transition-all"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) /
                        questionList.length) *
                      100
                    }%`,
                  }}
                />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">

                <p className="text-sm font-medium text-slate-500">
                  Question {currentQuestionIndex + 1}
                </p>

                <h2 className="mt-3 text-2xl font-bold leading-9">
                  {questionList[currentQuestionIndex]}
                </h2>

                <textarea
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                  placeholder="Type your answer as you would in a real interview..."
                  rows={10}
                  className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-500"
                />

                {/* Error */}
                {error && (
                  <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {/* Evaluate */}
                {!evaluation && (
                  <button
                    onClick={submitAnswer}
                    disabled={evaluating}
                    className="mt-5 w-full rounded-xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {evaluating
                      ? "Qwen3 is evaluating your answer..."
                      : "Evaluate My Answer"}
                  </button>
                )}

                {/* Evaluation */}
                {evaluation && (
                  <div className="mt-8">

                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500">
                        AI Evaluation
                      </p>

                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                        Qwen3 4B
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap rounded-xl bg-slate-950 p-6 leading-7 text-slate-300">
                      {evaluation}
                    </div>

                    {currentQuestionIndex <
                    questionList.length - 1 ? (
                      <button
                        onClick={nextQuestion}
                        className="mt-5 w-full rounded-xl bg-white px-6 py-4 font-semibold text-slate-950 transition hover:bg-slate-200"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <div className="mt-5 rounded-xl border border-slate-700 p-6 text-center">
                        <div className="text-3xl">
                          🎉
                        </div>

                        <p className="mt-3 font-semibold">
                          Mock interview complete
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          You completed all{" "}
                          {questionList.length} personalized
                          questions.
                        </p>

                        <button
                          onClick={backToQuestions}
                          className="mt-5 rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium transition hover:bg-slate-800"
                        >
                          Review Questions
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

        {/* Footer */}
        <p className="mt-12 text-center text-xs text-slate-600">
          FriendPrep AI • Private interview
          preparation powered by local AI
        </p>
      </div>
    </main>
  );
}