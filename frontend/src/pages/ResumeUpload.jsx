import React, { useRef, useState } from "react";
import { parseResumeFile } from "../api/api";

function ResumeUpload({ onNext }) {
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ HANDLE FILE UPLOAD + AUTO PARSE
  const handleFile = async (f) => {
    if (!f) return;

    setFile(f);
    setLoading(true);

    try {
      // 🔥 SEND FILE (NOT TEXT)
      const res = await parseResumeFile(f);

      console.log("Parsed response:", res);

      const extractedSkills = res.all_skills || [];

      setSkills(extractedSkills);

      // 🔥 STORE FOR NEXT PAGE
      localStorage.setItem("skills", JSON.stringify(extractedSkills));

    } catch (err) {
      console.error(err);
      alert("Parsing failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Upload your resume</h2>
      <p>Auto parsing skills using AI ⚡</p>

      {/* Upload Box */}
      <div
        style={{
          border: "2px dashed gray",
          padding: "40px",
          margin: "20px auto",
          width: "300px",
          cursor: "pointer",
        }}
        onClick={(e) => {
          if (e.target.tagName !== "BUTTON") {
            fileRef.current.click();
          }
        }}
      >
        {file ? <p>✅ {file.name}</p> : <p>Click to upload PDF</p>}
      </div>

      <input
        type="file"
        accept=".pdf"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {/* Loading */}
      {loading && <p>Parsing resume... ⏳</p>}

      {/* Skills Preview */}
      {skills.length > 0 && (
        <div>
          <h4>Extracted Skills:</h4>
          <div>
            {skills.map((s, i) => (
              <span
                key={i}
                style={{
                  margin: "5px",
                  padding: "5px 10px",
                  border: "1px solid #888",
                  borderRadius: "10px",
                  display: "inline-block",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* NEXT BUTTON */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => {
            if (skills.length === 0) {
              alert("No skills found!");
              return;
            }
            onNext({ skills });
          }}
          disabled={skills.length === 0}
          style={{
            padding: "10px 20px",
            background: "purple",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default ResumeUpload;