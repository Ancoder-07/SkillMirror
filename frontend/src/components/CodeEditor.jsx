import React, { useState } from "react";
import Editor from "@monaco-editor/react";

function CodeEditor({ code, onChange, skill }) {
  const detectLanguage = () => {
    const s = (skill || "").toLowerCase();

    if (s.includes("python")) return "python";
    if (s.includes("java")) return "java";
    if (s.includes("c++")) return "cpp";
    if (s.includes("javascript")) return "javascript";

    return "javascript";
  };

  const [language, setLanguage] = useState(detectLanguage());

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "0.5px solid #444" }}
    >
      {/* HEADER */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{
          background: "#161b22",
          borderBottom: "0.5px solid #444",
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />

        <span className="text-xs font-mono ml-1.5 text-gray-400">
          solution.{language}
        </span>

        {/* LANGUAGE DROPDOWN */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="ml-auto text-xs px-2 py-1 rounded bg-gray-800 text-purple-300 border border-purple-400"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      {/* EDITOR */}
      <Editor
        height="350px"
        language={language}
        theme="vs-dark"
        value={code}
        onChange={(value) => onChange(value || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default CodeEditor;