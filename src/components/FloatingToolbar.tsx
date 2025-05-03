import React from "react";

interface ToolbarProps {
  x: number;          // left position in viewport px
  y: number;          // top position in viewport px
  onChoose: (mode: "summary" | "analysis" | "quiz") => void;
}

const FloatingToolbar: React.FC<ToolbarProps> = ({ x, y, onChoose }) => (
  <div
    style={{
      position: "fixed",
      left: x,
      top: y,
      background: "#262626",
      color: "#fff",
      padding: "4px 8px",
      borderRadius: 4,
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      display: "flex",
      gap: 6,
      zIndex: 1000
    }}
  >
    <button onClick={() => onChoose("summary")}>Summarize</button>
    <button onClick={() => onChoose("analysis")}>Analyze</button>
    <button onClick={() => onChoose("quiz")}>Quiz</button>
  </div>
);

export default FloatingToolbar; 