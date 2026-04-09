import React, { useState } from "react";
import { Card, BtnPrimary, BtnGhost, Tag } from "../components/ui"; // adjust path if needed

function LiveChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [answer, setAnswer] = useState("");
  const [output, setOutput] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
const challenges = [

  // 🔢 APTITUDE (6)
  { id: 1, title: "Missing Number", category: "Aptitude", difficulty: "Easy", description: "2,4,6,?,10", example: "8", correct: "8" },
  { id: 2, title: "Speed Distance", category: "Aptitude", difficulty: "Medium", description: "Speed=60km/h, Time=2h", example: "120", correct: "120" },
  { id: 3, title: "Profit Loss", category: "Aptitude", difficulty: "Easy", description: "CP=100, SP=120", example: "20%", correct: "20%" },
  { id: 4, title: "Ratio", category: "Aptitude", difficulty: "Medium", description: "2:3, total=25", example: "10,15", correct: "10,15" },
  { id: 5, title: "Average", category: "Aptitude", difficulty: "Easy", description: "Avg of 2,4,6", example: "4", correct: "4" },
  { id: 6, title: "Time Work", category: "Aptitude", difficulty: "Medium", description: "A does work in 5 days", example: "1/5 per day", correct: "1/5" },

  // 🧠 LOGICAL (6)
  { id: 7, title: "Series Logic", category: "Logical", difficulty: "Easy", description: "1,1,2,3,5,?", example: "8", correct: "8" },
  { id: 8, title: "Odd One Out", category: "Logical", difficulty: "Easy", description: "Apple,Banana,Carrot,Mango", example: "Carrot", correct: "carrot" },
  { id: 9, title: "Pattern", category: "Logical", difficulty: "Medium", description: "A,C,E,?", example: "G", correct: "g" },
  { id: 10, title: "Coding Pattern", category: "Logical", difficulty: "Medium", description: "2→4,3→9,4→?", example: "16", correct: "16" },
  { id: 11, title: "Alphabet Series", category: "Logical", difficulty: "Easy", description: "Z,X,V,?", example: "T", correct: "t" },
  { id: 12, title: "Mirror Logic", category: "Logical", difficulty: "Medium", description: "If CAT=3120, DOG=?", example: "4157", correct: "4157" },

  // ➗ MATH (6)
  { id: 13, title: "Percentage", category: "Math", difficulty: "Easy", description: "10% of 500", example: "50", correct: "50" },
  { id: 14, title: "Square", category: "Math", difficulty: "Easy", description: "Square of 12", example: "144", correct: "144" },
  { id: 15, title: "Cube", category: "Math", difficulty: "Easy", description: "Cube of 3", example: "27", correct: "27" },
  { id: 16, title: "Simple Interest", category: "Math", difficulty: "Medium", description: "P=1000,R=5,T=2", example: "100", correct: "100" },
  { id: 17, title: "LCM", category: "Math", difficulty: "Medium", description: "LCM of 4 and 6", example: "12", correct: "12" },
  { id: 18, title: "HCF", category: "Math", difficulty: "Medium", description: "HCF of 12 and 18", example: "6", correct: "6" },

  // 📖 VERBAL (6)
  { id: 19, title: "Synonym", category: "Verbal", difficulty: "Easy", description: "Synonym of Happy", example: "Joyful", correct: "joyful" },
  { id: 20, title: "Antonym", category: "Verbal", difficulty: "Easy", description: "Opposite of Big", example: "Small", correct: "small" },
  { id: 21, title: "Fill Blank", category: "Verbal", difficulty: "Easy", description: "She ___ going to school", example: "is", correct: "is" },
  { id: 22, title: "Spelling", category: "Verbal", difficulty: "Medium", description: "Correct spelling: recieve/receive", example: "receive", correct: "receive" },
  { id: 23, title: "Analogy", category: "Verbal", difficulty: "Medium", description: "Cat : Kitten :: Dog : ?", example: "Puppy", correct: "puppy" },
  { id: 24, title: "One Word", category: "Verbal", difficulty: "Medium", description: "One word: Fear of heights", example: "Acrophobia", correct: "acrophobia" },

  // 💻 TECH (6)
  { id: 25, title: "Basic Output", category: "Tech", difficulty: "Easy", description: "2 + 3 * 2", example: "8", correct: "8" },
  { id: 26, title: "Data Type", category: "Tech", difficulty: "Easy", description: "Is 10.5 int or float?", example: "float", correct: "float" },
  { id: 27, title: "Binary", category: "Tech", difficulty: "Medium", description: "Binary of 5", example: "101", correct: "101" },
  { id: 28, title: "Loop Output", category: "Tech", difficulty: "Medium", description: "for i=1 to 3 print i", example: "123", correct: "123" },
  { id: 29, title: "HTML Tag", category: "Tech", difficulty: "Easy", description: "Tag for paragraph", example: "<p>", correct: "<p>" },
  { id: 30, title: "OOP Concept", category: "Tech", difficulty: "Medium", description: "Concept of reuse", example: "inheritance", correct: "inheritance" },

];

  const categories = ["All", "Aptitude", "Logical", "Math", "Verbal", "Tech"];

  const filteredChallenges =
    selectedCategory === "All"
      ? challenges
      : challenges.filter((c) => c.category === selectedCategory);

  const handleSubmit = () => {
    if (selectedChallenge.correct === answer.toLowerCase().trim()) {
      setIsCorrect(true);
      setOutput("🎉 Congratulations! You're doing amazing! 🚀");
    } else {
      setIsCorrect(false);
      setOutput("❌ Not correct. Try again!");
    }
  };

  const handleBack = () => {
    setSelectedChallenge(null);
    setAnswer("");
    setOutput("");
    setIsCorrect(false);
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ color: "var(--text)" }}>SkillMirror</h2>
        <BtnGhost>Login</BtnGhost>
      </div>

      {!selectedChallenge ? (
        <>
          <h2 style={{ textAlign: "center", fontSize: "32px" }}>welcome to <b style={{ color: 'var(--purple)' }}>Live Challenges </b> <br />
          <span style={{ fontSize: "0.9em", fontWeight: "normal" }}>
    May your coffee be strong and your bugs be few. ☕🐛
  </span>
          </h2>

          {/* FILTER */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {categories.map((cat) => (
              <BtnGhost
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  margin: "10px",
                  borderColor: selectedCategory === cat ? "var(--purple)" : undefined,
                  color: selectedCategory === cat ? "var(--text)" : undefined,
                }}
              >
                {cat}
              </BtnGhost>
            ))}
          </div>

          {/* CARDS */}
          <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    maxWidth: "900px",
    margin: "0 auto",
  }}
>
            {filteredChallenges.map((c) => (
              <Card key={c.id} style={{ padding: "20px", width: "260px" }}>
                
                {c.id === 1 && (
                  <span style={{ fontSize: "12px", color: "var(--amber)" }}>
                    🔥 Daily Challenge
                  </span>
                )}

                <h3>{c.title}</h3>
                <p style={{ color: "var(--muted)" }}>{c.category}</p>

                <Tag variant={c.difficulty === "Easy" ? "high" : "med"}>
                  {c.difficulty}
                </Tag>

                <div style={{ marginTop: "15px" }}>
                  <BtnPrimary onClick={() => setSelectedChallenge(c)}>
                    Solve
                  </BtnPrimary>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div style={{ maxWidth: "700px", margin: "auto" }}>
          <BtnGhost onClick={handleBack}>← Back</BtnGhost>

          <h2>{selectedChallenge.title}</h2>
          <p>{selectedChallenge.description}</p>
          {/* <p><b>{selectedChallenge.example}</b></p> */}

          <textarea
            rows="5"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write answer..."
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "10px",
              background: "var(--surface)",
              border: "1px solid var(--border2)",
              color: "var(--text)",
            }}
          />

          <div style={{ marginTop: "10px" }}>
            <BtnPrimary onClick={handleSubmit}>Submit</BtnPrimary>
          </div>

          {output && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                borderRadius: "8px",
                color: isCorrect ? "var(--green)" : "var(--red)",
              }}
            >
              {output}
            </div>
          )}

          {isCorrect && (
            <p style={{ color: "var(--green)" }}>
              🔥 Keep going! Try another challenge
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default LiveChallenges;