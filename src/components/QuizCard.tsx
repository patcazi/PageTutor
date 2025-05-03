import React, { useState } from "react";

export interface QuizItem {
  question: string;
  options: string[];
  answer: string;          // e.g., "B"
}

interface QuizCardProps {
  item: QuizItem;
  onComplete: (correct: boolean) => void; // notify parent and advance
}

const QuizCard: React.FC<QuizCardProps> = ({ item, onComplete }) => {
  const [choice, setChoice] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete(choice === item.answer);
  };

  return (
    <div style={{ marginTop: 8, padding: 8, border: "1px solid #ccc", borderRadius: 4 }}>
      <p><strong>{item.question}</strong></p>
      <form>
        {item.options.map((opt, i) => (
          <div key={i}>
            <label>
              <input
                type="radio"
                name="opt"
                value={opt.charAt(0)}   // "A", "B", etc.
                disabled={submitted}
                checked={choice === opt.charAt(0)}
                onChange={() => setChoice(opt.charAt(0))}
              />
              {opt}
            </label>
          </div>
        ))}
      </form>
      {!submitted ? (
        <button disabled={!choice} onClick={handleSubmit}>
          Submit
        </button>
      ) : (
        <div style={{ marginTop: 6 }}>
          {choice === item.answer ? "✅ Correct!" : `❌ Incorrect. Answer: ${item.answer}`}
        </div>
      )}
    </div>
  );
};

export default QuizCard; 