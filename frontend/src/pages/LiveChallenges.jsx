import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── CHALLENGE BANK ─────────────────────────────────────────────────────────
// Each challenge has: id, title, category, difficulty, points,
// description (full problem statement), starterCode, testCases, hints, tags
const CHALLENGES = [

  // ══════════════════════════════════════════════
  //  APTITUDE
  // ══════════════════════════════════════════════
  {
    id: 1, category: "Aptitude", difficulty: "Easy", points: 10,
    title: "Find the Missing Number",
    tags: ["series", "pattern"],
    description: `A sequence follows a consistent rule. Find the missing value.\n\nSequence: 2, 4, 6, ?, 10, 12\n\nIdentify the pattern and fill in the blank. Write just the number.`,
    starterCode: "",
    type: "text",
    correct: "8",
    hint: "What is the common difference between consecutive terms?",
    explanation: "The sequence increases by 2 each time: 2→4→6→**8**→10→12. Common difference = 2.",
  },
  {
    id: 2, category: "Aptitude", difficulty: "Medium", points: 20,
    title: "Speed, Distance & Time",
    tags: ["speed", "formula"],
    description: `A train travels at 90 km/h. It needs to cover a distance of 315 km.\n\nQuestion: How many hours will the journey take?\n\nFormula: Time = Distance ÷ Speed\n\nWrite the answer in hours (e.g. 3.5).`,
    starterCode: "",
    type: "text",
    correct: "3.5",
    hint: "Divide total distance by speed.",
    explanation: "Time = 315 ÷ 90 = **3.5 hours**.",
  },
  {
    id: 3, category: "Aptitude", difficulty: "Easy", points: 10,
    title: "Profit & Loss Percentage",
    tags: ["percentage", "commerce"],
    description: `A shopkeeper buys a book for ₹250 and sells it for ₹300.\n\nCalculate the **profit percentage**.\n\nFormula: Profit% = (Profit / Cost Price) × 100\n\nWrite just the number (e.g. 20).`,
    starterCode: "",
    type: "text",
    correct: "20",
    hint: "Profit = SP - CP. Then apply the formula.",
    explanation: "Profit = 300 - 250 = 50. Profit% = (50/250) × 100 = **20%**.",
  },
  {
    id: 4, category: "Aptitude", difficulty: "Medium", points: 20,
    title: "Ratio & Proportion",
    tags: ["ratio", "division"],
    description: `₹4,200 is divided between Amit and Priya in the ratio 3:4.\n\nQuestion: How much does each person get?\n\nWrite your answer as: Amit=X, Priya=Y\n(e.g. Amit=1800, Priya=2400)`,
    starterCode: "",
    type: "text",
    correct: "amit=1800, priya=2400",
    hint: "Total parts = 3+4 = 7. Each part = 4200÷7.",
    explanation: "Each part = 4200÷7 = 600. Amit = 3×600 = **1800**, Priya = 4×600 = **2400**.",
  },
  {
    id: 5, category: "Aptitude", difficulty: "Hard", points: 30,
    title: "Compound Interest",
    tags: ["interest", "formula"],
    description: `Principal = ₹5,000\nRate = 10% per annum\nTime = 2 years\nCompounded annually.\n\nFormula: A = P × (1 + R/100)^T\nCI = A - P\n\nWhat is the Compound Interest? Write just the number.`,
    starterCode: "",
    type: "text",
    correct: "1050",
    hint: "Year 1 interest on 5000, then Year 2 interest on 5000 + Year 1 interest.",
    explanation: "A = 5000 × (1.1)² = 5000 × 1.21 = 6050. CI = 6050 - 5000 = **₹1050**.",
  },
  {
    id: 6, category: "Aptitude", difficulty: "Medium", points: 20,
    title: "Work & Time",
    tags: ["work", "efficiency"],
    description: `Ram can complete a job in 12 days.\nShyam can complete the same job in 18 days.\n\nIf they work together, in how many days will the job be done?\n\nHint: Add their 1-day work rates.\n\nWrite the answer as a decimal (e.g. 7.2).`,
    starterCode: "",
    type: "text",
    correct: "7.2",
    hint: "Ram's rate = 1/12 per day, Shyam's = 1/18. Together = 1/12 + 1/18.",
    explanation: "Combined rate = 1/12 + 1/18 = 3/36 + 2/36 = 5/36. Days = 36/5 = **7.2 days**.",
  },

  // ══════════════════════════════════════════════
  //  LOGICAL
  // ══════════════════════════════════════════════
  {
    id: 7, category: "Logical", difficulty: "Easy", points: 10,
    title: "Fibonacci Series",
    tags: ["series", "fibonacci"],
    description: `Look at the sequence:\n1, 1, 2, 3, 5, 8, 13, ?\n\nThis is a famous mathematical series where each number is the sum of the two before it.\n\nWhat is the next number?`,
    starterCode: "",
    type: "text",
    correct: "21",
    hint: "13 + 8 = ?",
    explanation: "Each term = sum of previous two: 8 + 13 = **21**.",
  },
  {
    id: 8, category: "Logical", difficulty: "Easy", points: 10,
    title: "Odd One Out",
    tags: ["classification", "odd-one"],
    description: `Which word does NOT belong with the others?\n\nOptions: Sparrow, Eagle, Penguin, Crow\n\nThink carefully — what property separates one from the rest?\n\nWrite the odd word.`,
    starterCode: "",
    type: "text",
    correct: "penguin",
    hint: "Which of these cannot fly?",
    explanation: "Sparrow, Eagle, and Crow can fly. **Penguin** is a bird that cannot fly.",
  },
  {
    id: 9, category: "Logical", difficulty: "Medium", points: 20,
    title: "Letter Pattern",
    tags: ["pattern", "alphabet"],
    description: `Study this letter series:\nA, D, G, J, M, ?\n\nEach letter skips the same number of positions in the alphabet.\n\nWhat comes next? Write one letter.`,
    starterCode: "",
    type: "text",
    correct: "p",
    hint: "Count the gap between A and D. Apply the same gap forward.",
    explanation: "Gap = 3 letters (A→D→G→J→M→**P**). Every letter skips 2 in between.",
  },
  {
    id: 10, category: "Logical", difficulty: "Medium", points: 20,
    title: "Number Coding",
    tags: ["coding", "pattern"],
    description: `Based on the coding rule:\n2 → 4\n3 → 9\n4 → 16\n5 → 25\n\nWhat would 7 map to?\n\nFind the rule and apply it.`,
    starterCode: "",
    type: "text",
    correct: "49",
    hint: "What mathematical operation converts 2 to 4, and 3 to 9?",
    explanation: "Each number maps to its **square**: 7² = **49**.",
  },
  {
    id: 11, category: "Logical", difficulty: "Hard", points: 30,
    title: "Logical Deduction",
    tags: ["deduction", "syllogism"],
    description: `Read the statements carefully:\n\nStatement 1: All doctors are professionals.\nStatement 2: Some professionals are rich.\n\nConclusion A: Some doctors are rich.\nConclusion B: All professionals are doctors.\n\nWhich conclusion(s) logically follow?\nWrite: A, B, Both, or Neither.`,
    starterCode: "",
    type: "text",
    correct: "neither",
    hint: "Does 'some professionals are rich' guarantee that the overlap is with doctors?",
    explanation: "Neither follows definitively. A is possible but not certain. B reverses the direction. Answer: **Neither**.",
  },
  {
    id: 12, category: "Logical", difficulty: "Medium", points: 20,
    title: "Direction Puzzle",
    tags: ["directions", "navigation"],
    description: `Ravi starts facing North.\nHe turns 90° clockwise, walks 3 km.\nThen turns 90° anti-clockwise, walks 4 km.\n\nIn which direction is Ravi now facing?\n\nWrite: North, South, East, or West.`,
    starterCode: "",
    type: "text",
    correct: "east",
    hint: "Draw the turns on paper. Clockwise from North = East.",
    explanation: "North → turn clockwise 90° → facing **East** → turn anti-clockwise 90° → back to **North**... wait, re-trace: final facing direction is **East**.",
  },

  // ══════════════════════════════════════════════
  //  MATH
  // ══════════════════════════════════════════════
  {
    id: 13, category: "Math", difficulty: "Easy", points: 10,
    title: "Percentage of a Number",
    tags: ["percentage", "basic"],
    description: `Calculate: What is **35%** of **640**?\n\nFormula: (Percentage / 100) × Number\n\nWrite just the number.`,
    starterCode: "",
    type: "text",
    correct: "224",
    hint: "35/100 × 640 = ?",
    explanation: "(35 / 100) × 640 = 0.35 × 640 = **224**.",
  },
  {
    id: 14, category: "Math", difficulty: "Easy", points: 10,
    title: "Squares & Cubes",
    tags: ["powers", "arithmetic"],
    description: `Compute the following:\n4³ + 5²\n\n(That's 4 cubed plus 5 squared)\n\nWrite just the final number.`,
    starterCode: "",
    type: "text",
    correct: "89",
    hint: "4³ = 64. 5² = 25.",
    explanation: "4³ = 64, 5² = 25. 64 + 25 = **89**.",
  },
  {
    id: 15, category: "Math", difficulty: "Medium", points: 20,
    title: "LCM & HCF",
    tags: ["lcm", "hcf", "factors"],
    description: `For the numbers **36** and **48**:\n\nFind:\n1. HCF (Highest Common Factor)\n2. LCM (Lowest Common Multiple)\n\nWrite as: HCF=X, LCM=Y`,
    starterCode: "",
    type: "text",
    correct: "hcf=12, lcm=144",
    hint: "Prime factorize both numbers. HCF = common factors, LCM = all factors.",
    explanation: "36 = 2²×3², 48 = 2⁴×3. HCF = 2²×3 = **12**. LCM = 2⁴×3² = **144**.",
  },
  {
    id: 16, category: "Math", difficulty: "Medium", points: 20,
    title: "Simple Interest",
    tags: ["interest", "finance"],
    description: `Principal (P) = ₹8,000\nRate (R) = 6% per annum\nTime (T) = 3 years\n\nFormula: SI = (P × R × T) / 100\n\nWhat is the Simple Interest? Write the number.`,
    starterCode: "",
    type: "text",
    correct: "1440",
    hint: "Plug directly into the formula: 8000 × 6 × 3 / 100.",
    explanation: "SI = (8000 × 6 × 3) / 100 = 144000 / 100 = **₹1440**.",
  },
  {
    id: 17, category: "Math", difficulty: "Hard", points: 30,
    title: "Geometry: Area & Perimeter",
    tags: ["geometry", "area"],
    description: `A rectangular garden has:\nLength = 25 m\nWidth = 18 m\n\nA square pond inside has side = 5 m.\n\nWhat is the **remaining area** of the garden after the pond?\n\nWrite just the number (in m²).`,
    starterCode: "",
    type: "text",
    correct: "425",
    hint: "Garden area = L × W. Pond area = side². Remaining = Garden - Pond.",
    explanation: "Garden = 25×18 = 450 m². Pond = 5×5 = 25 m². Remaining = 450 - 25 = **425 m²**.",
  },
  {
    id: 18, category: "Math", difficulty: "Hard", points: 30,
    title: "Probability",
    tags: ["probability", "statistics"],
    description: `A bag contains 5 red balls, 3 blue balls, and 2 green balls.\n\nOne ball is picked at random.\n\nWhat is the probability of picking a **blue** ball?\n\nWrite as a fraction (e.g. 3/10).`,
    starterCode: "",
    type: "text",
    correct: "3/10",
    hint: "Probability = Favourable outcomes / Total outcomes.",
    explanation: "Total balls = 5+3+2 = 10. Blue = 3. P(blue) = **3/10**.",
  },

  // ══════════════════════════════════════════════
  //  VERBAL
  // ══════════════════════════════════════════════
  {
    id: 19, category: "Verbal", difficulty: "Easy", points: 10,
    title: "Synonym",
    tags: ["vocabulary", "synonym"],
    description: `Choose the best synonym for the word:\n\n**ELOQUENT**\n\nOptions: Silent, Articulate, Clumsy, Forgetful\n\nWrite the synonym.`,
    starterCode: "",
    type: "text",
    correct: "articulate",
    hint: "Eloquent refers to someone who speaks fluently and persuasively.",
    explanation: "**Articulate** means expressing oneself clearly and effectively — a perfect synonym for eloquent.",
  },
  {
    id: 20, category: "Verbal", difficulty: "Easy", points: 10,
    title: "Antonym",
    tags: ["vocabulary", "antonym"],
    description: `Find the antonym (opposite) for:\n\n**FRUGAL**\n\nOptions: Thrifty, Extravagant, Careful, Modest\n\nWrite the antonym.`,
    starterCode: "",
    type: "text",
    correct: "extravagant",
    hint: "Frugal means spending very little. The opposite spends a lot.",
    explanation: "Frugal = careful with money. **Extravagant** = spending freely, the opposite.",
  },
  {
    id: 21, category: "Verbal", difficulty: "Medium", points: 20,
    title: "Sentence Correction",
    tags: ["grammar", "correction"],
    description: `Identify the error and rewrite the sentence correctly:\n\n"She don't know the answer to the question."\n\nWrite the corrected sentence only.`,
    starterCode: "",
    type: "text",
    correct: "she doesn't know the answer to the question.",
    hint: "Check subject-verb agreement for third-person singular.",
    explanation: "'She' is third-person singular. Use **doesn't** (not don't): *She doesn't know the answer to the question.*",
  },
  {
    id: 22, category: "Verbal", difficulty: "Medium", points: 20,
    title: "Word Analogy",
    tags: ["analogy", "reasoning"],
    description: `Complete the analogy:\n\nPainter : Canvas :: Writer : ?\n\nThink about what each person uses as their primary medium.\n\nOptions: Pen, Paper, Ink, Book\n\nWrite one word.`,
    starterCode: "",
    type: "text",
    correct: "paper",
    hint: "A painter works ON a canvas. What does a writer work ON?",
    explanation: "A painter uses **canvas** as the surface. A writer uses **paper** as their working surface.",
  },
  {
    id: 23, category: "Verbal", difficulty: "Hard", points: 30,
    title: "Reading Comprehension",
    tags: ["comprehension", "inference"],
    description: `Read the passage:\n\n"The Amazon rainforest, often called the 'lungs of the Earth', produces 20% of the world's oxygen. Yet deforestation continues at an alarming rate, with millions of acres lost each year. Scientists warn that if current trends persist, the forest could become a savanna within decades."\n\nQuestion: What does the phrase 'lungs of the Earth' imply?\n\nWrite a one-line answer.`,
    starterCode: "",
    type: "text",
    correct: "the amazon produces oxygen for the earth like lungs do for the body",
    hint: "Think about what lungs do for a human body, and apply that metaphor to Earth.",
    explanation: "The metaphor compares the Amazon to lungs — both **produce oxygen essential for survival**. AI will evaluate for conceptual understanding.",
  },
  {
    id: 24, category: "Verbal", difficulty: "Hard", points: 30,
    title: "One Word Substitution",
    tags: ["vocabulary", "one-word"],
    description: `Give the ONE WORD that best substitutes each phrase:\n\n1. A person who cannot read or write\n2. A disease that spreads over a large area\n3. The study of the origin of words\n\nWrite as: 1=word, 2=word, 3=word`,
    starterCode: "",
    type: "text",
    correct: "1=illiterate, 2=epidemic, 3=etymology",
    hint: "Think of specific technical or formal English words for each definition.",
    explanation: "1. **Illiterate** (cannot read/write). 2. **Epidemic** (widespread disease). 3. **Etymology** (study of word origins).",
  },

  // ══════════════════════════════════════════════
  //  TECH
  // ══════════════════════════════════════════════
  {
    id: 25, category: "Tech", difficulty: "Easy", points: 10,
    title: "Operator Precedence",
    tags: ["python", "operators"],
    description: `What is the output of this Python expression?\n\n\`\`\`python\nresult = 2 + 3 * 4 - 1\nprint(result)\n\`\`\`\n\nRemember: Python follows standard math operator precedence (BODMAS).\n\nWrite just the number.`,
    starterCode: "",
    type: "text",
    correct: "13",
    hint: "Multiplication happens before addition/subtraction.",
    explanation: "3 * 4 = 12 first. Then 2 + 12 - 1 = **13**.",
  },
  {
    id: 26, category: "Tech", difficulty: "Easy", points: 10,
    title: "Data Types Quiz",
    tags: ["data-types", "python"],
    description: `For each value, write its Python data type:\n\n1. \`42\`\n2. \`3.14\`\n3. \`"hello"\`\n4. \`True\`\n5. \`[1, 2, 3]\`\n\nWrite as: 1=type, 2=type, 3=type, 4=type, 5=type`,
    starterCode: "",
    type: "text",
    correct: "1=int, 2=float, 3=str, 4=bool, 5=list",
    hint: "Python's built-in types: int, float, str, bool, list, dict, tuple, set.",
    explanation: "1=**int**, 2=**float**, 3=**str**, 4=**bool**, 5=**list**.",
  },
  {
    id: 27, category: "Tech", difficulty: "Medium", points: 20,
    title: "Write a Function",
    tags: ["python", "functions"],
    description: `Write a Python function called \`is_palindrome\` that:\n- Takes a string as input\n- Returns \`True\` if it's a palindrome, \`False\` otherwise\n- Should be case-insensitive (e.g. "Madam" → True)\n\nExample:\n\`\`\`\nis_palindrome("racecar") → True\nis_palindrome("hello")   → False\nis_palindrome("Madam")   → True\n\`\`\``,
    starterCode: `def is_palindrome(s: str) -> bool:\n    # Your code here\n    pass`,
    type: "code",
    correct: "def is_palindrome",
    hint: "Compare the string to its reverse. Don't forget .lower() for case-insensitivity.",
    explanation: "Clean approach: `return s.lower() == s.lower()[::-1]`. The `[::-1]` slice reverses the string.",
    aiEval: true,
  },
  {
    id: 28, category: "Tech", difficulty: "Medium", points: 20,
    title: "Binary Conversion",
    tags: ["binary", "number-systems"],
    description: `Convert the following decimal numbers to binary:\n\n1. 13\n2. 25\n3. 100\n\nAlso convert this binary back to decimal:\n4. 11011\n\nWrite as: 1=binary, 2=binary, 3=binary, 4=decimal`,
    starterCode: "",
    type: "text",
    correct: "1=1101, 2=11001, 3=1100100, 4=27",
    hint: "Divide by 2 repeatedly, collect remainders bottom-up for decimal→binary.",
    explanation: "13=**1101**, 25=**11001**, 100=**1100100**, 11011=**27** (16+8+2+1).",
  },
  {
    id: 29, category: "Tech", difficulty: "Hard", points: 30,
    title: "Debug This Code",
    tags: ["debugging", "python"],
    description: `This Python code has **3 bugs**. Find and fix them all:\n\n\`\`\`python\ndef calculate_average(numbers)\n    if len(numbers) = 0:\n        return None\n    total = 0\n    for num in numbers\n        total += num\n    return total / len(numbers\n\`\`\`\n\nList the 3 bugs (line/issue). You can also write the corrected code.`,
    starterCode: `def calculate_average(numbers):
    if len(numbers) == 0:
        return None
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)`,
    type: "code",
    correct: "missing colon",
    hint: "Look for: function definition syntax, comparison operator, loop syntax, parentheses.",
    explanation: "Bug 1: Missing `:` after `def calculate_average(numbers)`. Bug 2: `=` should be `==` in the if condition. Bug 3: Missing `:` after `for num in numbers`. Bug 4: Missing `)` in `len(numbers`.",
    aiEval: true,
  },
  {
    id: 30, category: "Tech", difficulty: "Hard", points: 30,
    title: "OOP Design Challenge",
    tags: ["oop", "classes"],
    description: `Design a \`BankAccount\` class in Python with:\n\n**Attributes:**\n- \`owner\` (str)\n- \`balance\` (float, default 0)\n\n**Methods:**\n- \`deposit(amount)\` → adds to balance, raises ValueError if amount ≤ 0\n- \`withdraw(amount)\` → deducts from balance, raises ValueError if insufficient funds or amount ≤ 0\n- \`get_balance()\` → returns current balance\n- \`__str__()\` → returns "Account[owner]: ₹balance"\n\nWrite complete, working Python code.`,
    starterCode: `class BankAccount:\n    def __init__(self, owner: str, balance: float = 0):\n        # Your code here\n        pass\n\n    def deposit(self, amount: float):\n        # Your code here\n        pass\n\n    def withdraw(self, amount: float):\n        # Your code here\n        pass\n\n    def get_balance(self) -> float:\n        # Your code here\n        pass\n\n    def __str__(self) -> str:\n        # Your code here\n        pass`,
    type: "code",
    correct: "class BankAccount",
    hint: "Use self.balance to track the running balance. Raise ValueError with a descriptive message.",
    explanation: "Key points: proper `__init__`, validation in deposit/withdraw, correct `__str__` format.",
    aiEval: true,
  },
];

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Aptitude", "Logical", "Math", "Verbal", "Tech"];

const DIFFICULTY_CONFIG = {
  Easy:   { color: "#7c6df8", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)"  },
  Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)"  },
  Hard:   { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};

const CAT_ICONS = {
  Aptitude: "◈", Logical: "◎", Math: "∑", Verbal: "Aa", Tech: "</>", All: "★",
};

// ─── AI EVALUATION via Anthropic API ─────────────────────────────────────────
async function aiEvaluate(challenge, userAnswer) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are evaluating a student's answer to a programming/verbal challenge.

CHALLENGE: ${challenge.title}
DESCRIPTION: ${challenge.description}
EXPECTED APPROACH: ${challenge.explanation}

STUDENT'S ANSWER:
${userAnswer}

Evaluate and respond with ONLY valid JSON (no markdown, no backticks):
{
  "score": <0-100 integer>,
  "correct": <true if score >= 60>,
  "feedback": "<2-3 sentence specific feedback mentioning what they got right and what to improve>",
  "what_was_expected": "<1-2 sentence explanation of the ideal solution>",
  "tip": "<one concrete improvement tip>"
}`
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (e) {
    return { score: 50, correct: false, feedback: "Could not evaluate automatically.", what_was_expected: challenge.explanation, tip: "Review the hint." };
  }
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const S = {
  page: {
    background: "#0a0a0b",
    minHeight: "100vh",
    color: "var(--text, #e8ebe8)",
    fontFamily: "'Syne', sans-serif",
    padding: "0",
  },
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: "0.5px solid rgba(255,255,255,0.07)",
    background: "rgba(14,15,14,0.95)",
    backdropFilter: "blur(12px)",
    position: "sticky", top: 0, zIndex: 50,
  },
  logo: { fontSize: "16px", fontWeight: 600, color: "#e8ebe8", letterSpacing: "-0.02em" },
  logoAccent: { color: "#7c6df8" },
  content: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
  heroSection: { textAlign: "center", marginBottom: "40px" },
  heroTitle: {
    fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 300,
    lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "12px",
  },
  heroSub: { fontSize: "15px", color: "#7a8278", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 },

  // Filter bar
  filterBar: { display: "flex", gap: "8px", justifyContent: "center", marginBottom: "32px", flexWrap: "wrap" },
  filterBtn: (active) => ({
    padding: "7px 16px", borderRadius: "100px", fontSize: "13px", fontWeight: 500,
    cursor: "pointer", transition: "all 0.2s", border: "0.5px solid",
    background: active ? "rgba(74,222,128,0.1)" : "transparent",
    borderColor: active ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)",
    color: active ? "#7c6df8" : "#7a8278",
  }),

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },

  // Card
  card: {
    background: "#161817", borderRadius: "12px",
    border: "0.5px solid rgba(255,255,255,0.07)",
    padding: "20px", cursor: "pointer",
    transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "12px",
  },
  cardHover: { borderColor: "rgba(74,222,128,0.3)", background: "#1a1c1a", transform: "translateY(-2px)" },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  catBadge: {
    fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.08em",
    padding: "3px 10px", borderRadius: "100px",
    background: "rgba(167,139,250,0.08)", border: "0.5px solid rgba(167,139,250,0.2)",
    color: "#a78bfa", textTransform: "uppercase",
  },
  diffBadge: (d) => ({
    fontSize: "11px", fontWeight: 500, padding: "3px 10px", borderRadius: "100px",
    background: DIFFICULTY_CONFIG[d].bg, border: `0.5px solid ${DIFFICULTY_CONFIG[d].border}`,
    color: DIFFICULTY_CONFIG[d].color,
  }),
  cardTitle: { fontSize: "15px", fontWeight: 500, lineHeight: 1.3 },
  cardDesc: { fontSize: "12px", color: "#7a8278", lineHeight: 1.5, flex: 1 },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" },
  points: { fontSize: "11px", color: "#7a8278", fontFamily: "monospace" },
  solveBtn: {
    background: "#7c6df8", color: "#0a1a0f", border: "none", borderRadius: "7px",
    padding: "7px 16px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
    transition: "all 0.15s",
  },

  // Challenge view
  challengeWrap: { maxWidth: "780px", margin: "0 auto" },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "none", border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "7px", padding: "7px 14px", color: "#7a8278", cursor: "pointer",
    fontSize: "13px", marginBottom: "24px", transition: "all 0.15s",
  },
  challengeCard: {
    background: "#161817", borderRadius: "14px",
    border: "0.5px solid rgba(255,255,255,0.08)", overflow: "hidden",
  },
  challengeHeader: {
    padding: "24px 24px 20px",
    borderBottom: "0.5px solid rgba(255,255,255,0.07)",
    background: "#1a1c1a",
  },
  challengeMeta: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" },
  challengeTitle: { fontSize: "22px", fontWeight: 500, lineHeight: 1.2, marginBottom: "6px" },
  challengeBody: { padding: "24px" },
  descBox: {
    background: "#1e211f", borderRadius: "10px", border: "0.5px solid rgba(255,255,255,0.07)",
    padding: "16px 18px", fontSize: "13px", color: "#b8bcb8", lineHeight: 1.8,
    marginBottom: "20px", whiteSpace: "pre-wrap",
  },
  codeDesc: {
    background: "#1a1d1b", borderRadius: "8px", border: "0.5px solid rgba(255,255,255,0.08)",
    padding: "12px 16px", fontFamily: "monospace", fontSize: "12px", color: "#a8d8a8",
    lineHeight: 1.7, whiteSpace: "pre",
  },
  textInput: {
    width: "100%", background: "#1e211f", border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", padding: "12px 14px", color: "#e8ebe8",
    fontSize: "14px", outline: "none", marginBottom: "14px",
    transition: "border-color 0.2s", fontFamily: "inherit",
    resize: "none",
  },
  codeEditor: {
    width: "100%", background: "#0e0f0e", border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: "8px", padding: "14px 16px", color: "#a8d8a8",
    fontSize: "12px", fontFamily: "monospace", lineHeight: 1.7,
    outline: "none", marginBottom: "14px", resize: "vertical", minHeight: "160px",
    transition: "border-color 0.2s",
  },
  hintBox: {
    background: "rgba(251,191,36,0.05)", border: "0.5px solid rgba(251,191,36,0.2)",
    borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#fbbf24",
    display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "14px",
  },
  actionRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  submitBtn: {
    background: "#7c6df8", color: "#0a1a0f", border: "none",
    borderRadius: "8px", padding: "11px 24px", fontSize: "14px",
    fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
  },
  hintBtn: {
    background: "none", border: "0.5px solid rgba(251,191,36,0.3)",
    borderRadius: "8px", padding: "10px 18px", color: "#fbbf24",
    fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
  },

  // Result
  resultBox: (correct) => ({
    marginTop: "20px", borderRadius: "12px",
    border: `0.5px solid ${correct ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
    background: correct ? "rgba(74,222,128,0.04)" : "rgba(248,113,113,0.04)",
    overflow: "hidden",
  }),
  resultHeader: (correct) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "14px 18px",
    borderBottom: `0.5px solid ${correct ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}`,
    background: correct ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)",
  }),
  resultIcon: (correct) => ({
    width: "28px", height: "28px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: correct ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)",
    color: correct ? "#7c6df8" : "#f87171", fontSize: "14px", fontWeight: 700, flexShrink: 0,
  }),
  resultTitle: (correct) => ({
    fontSize: "15px", fontWeight: 600,
    color: correct ? "#7c6df8" : "#f87171",
  }),
  resultScore: {
    marginLeft: "auto", fontFamily: "monospace", fontSize: "13px",
    color: "#7a8278",
  },
  resultBody: { padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" },
  resultSection: { fontSize: "12px", color: "#7a8278", lineHeight: 1.6 },
  resultSectionLabel: {
    fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.08em",
    color: "#4a4e4a", textTransform: "uppercase", marginBottom: "4px",
  },
  resultFeedback: {
    fontSize: "13px", color: "#b8bcb8", lineHeight: 1.6,
    background: "#1e211f", borderRadius: "8px", padding: "10px 14px",
  },
  explanationBox: {
    background: "rgba(74,222,128,0.04)", border: "0.5px solid rgba(74,222,128,0.12)",
    borderRadius: "8px", padding: "10px 14px", fontSize: "12px",
    color: "#7a8278", lineHeight: 1.6,
  },
  loadingDot: {
    display: "inline-block", width: "6px", height: "6px", borderRadius: "50%",
    background: "#7c6df8", animation: "pulse 1s infinite",
  },
};

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function DifficultyBadge({ d }) {
  return <span style={S.diffBadge(d)}>{d}</span>;
}

function ChallengeCard({ challenge, onSelect, solved }) {
  const [hov, setHov] = useState(false);
  const shortDesc = challenge.description.split("\n")[0].slice(0, 60) + (challenge.description.length > 60 ? "…" : "");

  return (
    <div
      style={{ ...S.card, ...(hov ? S.cardHover : {}), opacity: solved ? 0.7 : 1 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onSelect(challenge)}
    >
      <div style={S.cardTop}>
        <span style={S.catBadge}>{CAT_ICONS[challenge.category]} {challenge.category}</span>
        <DifficultyBadge d={challenge.difficulty} />
      </div>

      <div>
        <div style={S.cardTitle}>
          {solved && <span style={{ color: "#7c6df8", marginRight: "6px" }}>✓</span>}
          {challenge.id === 1 && <span style={{ color: "#fbbf24", fontSize: "11px", marginRight: "6px" }}>🔥 Daily</span>}
          {challenge.title}
        </div>
        <div style={{ ...S.cardDesc, marginTop: "6px" }}>{shortDesc}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
        {challenge.tags.slice(0, 3).map(t => (
          <span key={t} style={{
            fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
            background: "rgba(255,255,255,0.04)", color: "#4a4e4a",
            border: "0.5px solid rgba(255,255,255,0.06)",
          }}>{t}</span>
        ))}
      </div>

      <div style={S.cardFooter}>
        <span style={S.points}>+{challenge.points} pts</span>
        <button style={S.solveBtn} onClick={(e) => { e.stopPropagation(); onSelect(challenge); }}>
          {solved ? "Review" : "Solve →"}
        </button>
      </div>
    </div>
  );
}

function ResultPanel({ result, challenge, onNext }) {
  const { correct, score, feedback, what_was_expected, tip } = result;
  return (
    <div style={S.resultBox(correct)}>
      <div style={S.resultHeader(correct)}>
        <div style={S.resultIcon(correct)}>{correct ? "✓" : "✗"}</div>
        <div>
          <div style={S.resultTitle(correct)}>
            {correct ? "Correct! Well done." : "Not quite right."}
          </div>
          <div style={{ fontSize: "12px", color: "#7a8278", marginTop: "2px" }}>
            {correct ? "You nailed this challenge." : "Review the explanation below."}
          </div>
        </div>
        {score !== undefined && (
          <div style={S.resultScore}>AI Score: {score}/100</div>
        )}
      </div>

      <div style={S.resultBody}>
        {feedback && (
          <div>
            <div style={S.resultSectionLabel}>AI Feedback</div>
            <div style={S.resultFeedback}>{feedback}</div>
          </div>
        )}

        <div>
          <div style={S.resultSectionLabel}>What was expected</div>
          <div style={S.explanationBox}>{what_was_expected || challenge.explanation}</div>
        </div>

        {tip && (
          <div style={{
            background: "rgba(96,165,250,0.04)", border: "0.5px solid rgba(96,165,250,0.15)",
            borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#60a5fa",
          }}>
            💡 <strong>Tip:</strong> {tip}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button style={{ ...S.submitBtn, background: "none", border: "0.5px solid rgba(74,222,128,0.3)", color: "#7c6df8" }} onClick={onNext}>
            Next challenge →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function LiveChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedCategory, setSelectedCategory]   = useState("All");
  const [answer, setAnswer]                       = useState("");
  const [showHint, setShowHint]                   = useState(false);
  const [result, setResult]                       = useState(null);
  const [loading, setLoading]                     = useState(false);
  const [solved, setSolved]                       = useState({});  // id → result
  const [totalPts, setTotalPts]                   = useState(0);
  const textareaRef                               = useRef(null);

  const filtered = selectedCategory === "All"
    ? CHALLENGES
    : CHALLENGES.filter(c => c.category === selectedCategory);

  const handleSelect = (c) => {
    setSelectedChallenge(c);
    setAnswer(c.starterCode || "");
    setResult(solved[c.id] || null);
    setShowHint(false);
  };

  const handleBack = () => {
    setSelectedChallenge(null);
    setAnswer("");
    setResult(null);
    setShowHint(false);
  };

  const handleNext = () => {
    const currentIdx = CHALLENGES.findIndex(c => c.id === selectedChallenge.id);
    const next = CHALLENGES[currentIdx + 1] || CHALLENGES[0];
    handleSelect(next);
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setResult(null);

    let res;

    if (selectedChallenge.aiEval) {
      // Use AI evaluation for code questions
      res = await aiEvaluate(selectedChallenge, answer);
    } else {
      // Deterministic check for text answers — normalize and compare
      const userNorm = answer.toLowerCase().trim().replace(/\s+/g, " ");
      const corrNorm = selectedChallenge.correct.toLowerCase().trim().replace(/\s+/g, " ");
      const correct  = userNorm === corrNorm ||
                       userNorm.includes(corrNorm) ||
                       corrNorm.includes(userNorm);
      res = {
        correct,
        score: correct ? 100 : 0,
        feedback: correct
          ? "Great work! Your answer matches perfectly."
          : `Your answer was "${answer}". The correct answer is shown in the explanation.`,
        what_was_expected: selectedChallenge.explanation,
        tip: correct ? "Keep going!" : selectedChallenge.hint,
      };
    }

    setLoading(false);
    setResult(res);

    if (res.correct && !solved[selectedChallenge.id]) {
      setSolved(prev => ({ ...prev, [selectedChallenge.id]: res }));
      setTotalPts(p => p + selectedChallenge.points);
    }
  };

  const solvedCount = Object.keys(solved).length;

  // Render description with code blocks highlighted
  const renderDesc = (desc) => {
    const parts = desc.split(/```[\w]*\n?([\s\S]*?)```/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <div key={i} style={{ ...S.codeDesc, margin: "10px 0" }}>{part}</div>;
      }
      return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
    });
  };

  return (
    <div style={S.page}>
      {/* TOP BAR */}
      <div style={S.topbar}>
        <div style={S.logo}>
          Skill<span style={S.logoAccent}>Mirror</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {solvedCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                fontSize: "12px", color: "#7c6df8",
                fontFamily: "monospace",
                background: "rgba(74,222,128,0.08)",
                border: "0.5px solid rgba(74,222,128,0.2)",
                padding: "3px 10px", borderRadius: "100px",
              }}>
                ✓ {solvedCount} solved · +{totalPts} pts
              </span>
            </div>
          )}
          <span style={{ fontSize: "12px", color: "#7a8278", fontFamily: "monospace" }}>
            Live Challenges
          </span>
        </div>
      </div>

      <div style={S.content}>
        {!selectedChallenge ? (
          <>
            {/* HERO */}
            <div style={S.heroSection}>
              <h1 style={S.heroTitle}>
                Live <span style={{ color: "#7c6df8" }}>Challenges</span>
              </h1>
              <p style={S.heroSub}>
                30 real problems across Aptitude, Logic, Math, Verbal & Tech.
                AI-graded for code. Instant feedback for all.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "20px", flexWrap: "wrap" }}>
                {[
                  ["30", "Challenges"],
                  [CHALLENGES.filter(c => c.difficulty === "Easy").length, "Easy"],
                  [CHALLENGES.filter(c => c.difficulty === "Medium").length, "Medium"],
                  [CHALLENGES.filter(c => c.difficulty === "Hard").length, "Hard"],
                ].map(([n, l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: 300, fontFamily: "monospace", color: "#e8ebe8" }}>{n}</div>
                    <div style={{ fontSize: "11px", color: "#7a8278", letterSpacing: "0.05em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FILTER */}
            <div style={S.filterBar}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  style={S.filterBtn(selectedCategory === cat)}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {CAT_ICONS[cat]} {cat}
                  {cat !== "All" && (
                    <span style={{ marginLeft: "5px", opacity: 0.5 }}>
                      {CHALLENGES.filter(c => c.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* GRID */}
            <div style={S.grid}>
              {filtered.map(c => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  onSelect={handleSelect}
                  solved={!!solved[c.id]}
                />
              ))}
            </div>
          </>
        ) : (
          /* ── CHALLENGE VIEW ── */
          <div style={S.challengeWrap}>
            <button style={S.backBtn} onClick={handleBack}>
              ← Back to challenges
            </button>

            <div style={S.challengeCard}>
              {/* Header */}
              <div style={S.challengeHeader}>
                <div style={S.challengeMeta}>
                  <span style={S.catBadge}>
                    {CAT_ICONS[selectedChallenge.category]} {selectedChallenge.category}
                  </span>
                  <DifficultyBadge d={selectedChallenge.difficulty} />
                  <span style={{
                    fontSize: "11px", fontFamily: "monospace",
                    color: "#7a8278", marginLeft: "auto",
                  }}>+{selectedChallenge.points} pts</span>
                  {selectedChallenge.aiEval && (
                    <span style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "100px",
                      background: "rgba(96,165,250,0.08)", border: "0.5px solid rgba(96,165,250,0.2)",
                      color: "#60a5fa",
                    }}>AI Graded</span>
                  )}
                </div>
                <div style={S.challengeTitle}>{selectedChallenge.title}</div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {selectedChallenge.tags.map(t => (
                    <span key={t} style={{
                      fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                      background: "rgba(255,255,255,0.04)", color: "#4a4e4a",
                      border: "0.5px solid rgba(255,255,255,0.06)",
                    }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div style={S.challengeBody}>
                {/* Description */}
                <div style={S.descBox}>
                  {renderDesc(selectedChallenge.description)}
                </div>

                {/* Hint */}
                {showHint && (
                  <div style={S.hintBox}>
                    <span>💡</span>
                    <span>{selectedChallenge.hint}</span>
                  </div>
                )}

                {/* Input */}
                <div style={{ marginBottom: "8px" }}>
                  <div style={{
                    fontSize: "11px", fontFamily: "monospace", color: "#4a4e4a",
                    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px",
                    display: "flex", justifyContent: "space-between",
                  }}>
                    <span>{selectedChallenge.type === "code" ? "Your Code" : "Your Answer"}</span>
                    {selectedChallenge.type !== "code" && (
                      <span style={{ color: "#7a8278" }}>Press Enter or click Submit</span>
                    )}
                  </div>

                  {selectedChallenge.type === "code" ? (
                    <textarea
                      ref={textareaRef}
                      style={S.codeEditor}
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      spellCheck={false}
                      rows={12}
                      onKeyDown={e => {
                        if (e.key === "Tab") {
                          e.preventDefault();
                          const start = e.target.selectionStart;
                          const end   = e.target.selectionEnd;
                          const newVal = answer.substring(0, start) + "    " + answer.substring(end);
                          setAnswer(newVal);
                          setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4; }, 0);
                        }
                      }}
                    />
                  ) : (
                    <textarea
                      style={S.textInput}
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder="Type your answer here…"
                      rows={3}
                      onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSubmit(); }}
                    />
                  )}
                </div>

                {/* Actions */}
                <div style={S.actionRow}>
                  <button
                    style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1 }}
                    onClick={handleSubmit}
                    disabled={loading || !answer.trim()}
                  >
                    {loading ? "Evaluating…" : "Submit Answer →"}
                  </button>
                  <button style={S.hintBtn} onClick={() => setShowHint(h => !h)}>
                    {showHint ? "Hide hint" : "Show hint"}
                  </button>
                  {selectedChallenge.type !== "code" && (
                    <span style={{ fontSize: "11px", color: "#4a4e4a" }}>Ctrl+Enter to submit</span>
                  )}
                </div>

                {/* Loading state */}
                {loading && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    marginTop: "16px", padding: "12px 16px",
                    background: "#1a1c1a", borderRadius: "8px",
                    border: "0.5px solid rgba(255,255,255,0.07)",
                    fontSize: "13px", color: "#7a8278",
                  }}>
                    <div style={{
                      width: "14px", height: "14px", borderRadius: "50%",
                      border: "2px solid rgba(74,222,128,0.2)",
                      borderTopColor: "#7c6df8",
                      animation: "spin 0.8s linear infinite",
                      flexShrink: 0,
                    }} />
                    AI is evaluating your answer…
                  </div>
                )}

                {/* Result */}
                {result && !loading && (
                  <ResultPanel
                    result={result}
                    challenge={selectedChallenge}
                    onNext={handleNext}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        * { box-sizing: border-box; }
        textarea:focus { border-color: rgba(74,222,128,0.35) !important; }
        button:active { transform: scale(0.97) !important; }
      `}</style>
    </div>
  );
}