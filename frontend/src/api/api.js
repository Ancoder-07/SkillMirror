const BASE_URL = "http://127.0.0.1:8000/api";

// ✅ PARSE RESUME (PDF FILE)
export const parseResumeFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/parse-resume`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

// ✅ START TEST
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

// ✅ NEXT QUESTION
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

// ✅ SUBMIT ANSWER
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