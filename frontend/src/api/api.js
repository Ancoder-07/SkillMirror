const BASE_URL = "http://127.0.0.1:8000/api";

// ===============================
// ✅ PARSE RESUME (PDF FILE)
// ===============================
export const parseResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/parse-resume`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to parse resume");
  }

  return res.json();
};

// ===============================
// ✅ START TEST
// ===============================
export const startTest = async (skill, level = "medium") => {
  const res = await fetch(`${BASE_URL}/start-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ skill, level }),
  });

  return res.json();
};

// ===============================
// ✅ NEXT QUESTION
// ===============================
export const nextQuestion = async (test_id) => {
  const res = await fetch(`${BASE_URL}/next-question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ test_id }),
  });

  return res.json();
};

// ===============================
// ✅ SUBMIT ANSWER
// ===============================
export const submitAnswer = async (test_id, answer) => {
  const res = await fetch(`${BASE_URL}/submit-answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ test_id, answer }),
  });

  return res.json();
};

// ===============================
// ✅ EVALUATE SESSION (MAIN)
// ===============================
export const evaluateSession = async ({
  skill,
  level,
  question,
  user_code,
  time_taken_seconds = 0,
  rewrite_count = 0,
  tab_switches = 0,
}) => {
  const res = await fetch(`${BASE_URL}/evaluate/code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      skill,
      level,
      question,
      user_code,
      time_taken_seconds,
      rewrite_count,
      tab_switches,
    }),
  });

  return res.json();
};
// ===============================
// ✅ PARSE TEXT (NEW - REQUIRED)
// ===============================
export const parseText = async (text) => {
  const res = await fetch(`${BASE_URL}/parse-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to parse text");
  }

  return res.json();
};

// ===============================
// ⚠️ OPTIONAL (USE ONLY IF BACKEND EXISTS)
// ===============================
/*
export const evaluateSession = async (payload) => {
  const res = await fetch(`${BASE_URL}/evaluate/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
};
*/