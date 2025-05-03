import React, { useState } from "react";
import QuizCard, { QuizItem } from "./QuizCard";

interface QuizSessionProps {
  quiz: QuizItem[];
}

const QuizSession: React.FC<QuizSessionProps> = ({ quiz }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleComplete = (correct: boolean) => {
    if (correct) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (index + 1 < quiz.length) {
      setIndex(i => i + 1);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <div style={{ marginTop: 8 }}>
        <strong>Quiz finished!</strong>
        <p>You got {score} / {quiz.length} correct.</p>
      </div>
    );
  }

  return (
    <div>
      <p>Question {index + 1} / {quiz.length}</p>
      <QuizCard key={index} qIndex={index} item={quiz[index]} onComplete={handleComplete} />
      <button style={{ marginTop: 8 }} onClick={nextQuestion}>
        {index + 1 < quiz.length ? "Next" : "Finish"}
      </button>
    </div>
  );
};

export default QuizSession; 