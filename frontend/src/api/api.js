const BASE_URL = "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

// ===============================
// PARSE RESUME (PDF FILE)
// ===============================
export const parseResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/parse-resume`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to parse resume");
  }

  return res.json();
};

// ===============================
// START TEST
// ===============================
export const startTest = async (skill, level = "medium") => {
  const res = await fetch(`${BASE_URL}/start-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ skill, level }),
  });
  return res.json();
};

// ===============================

// ✅ NEXT QUESTION (FIXED)
// ===============================
export const nextQuestion = async (test_id) => {
  const res = await fetch(`${BASE_URL}/next-question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ test_id }),
  });
  return res.json();
};

// ===============================

// ✅ SUBMIT ANSWER (FIXED)
// ===============================
export const submitAnswer = async (test_id, answer) => {
  const res = await fetch(`${BASE_URL}/submit-answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ test_id, answer }),
  });
  return res.json();
};

// ===============================
// EVALUATE SESSION  ← FIXED
// Sends all 4 questions + answers at once.
// Each item in questions_and_answers:
// {
//   question:           { full question object },
//   answer:             "user's answer",
//   type:               "mcq" | "coding" | "numerical",
//   time_taken_seconds: number,
//   rewrite_count:      number,
//   tab_switches:       number,
// }
// ===============================
export const evaluateSession = async ({
  skill,
  level,
  questions_and_answers,
  test_id = null,
}) => {
  const res = await fetch(`${BASE_URL}/evaluate/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      skill,
      level,
      questions_and_answers,
      test_id,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Evaluation failed");
  }

  return res.json();
};

// ===============================
// PARSE TEXT
// ===============================
export const parseText = async (text) => {
  const res = await fetch(`${BASE_URL}/parse-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to parse text");
  }

  return res.json();
};