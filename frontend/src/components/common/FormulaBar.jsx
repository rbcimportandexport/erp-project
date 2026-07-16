import { useEffect, useState } from "react";

const FormulaBar = ({ activeCell, onSave }) => {
  const [inputValue, setInputValue] = useState("");

  // Update input value when selection changes
  useEffect(() => {
    if (activeCell) {
      setInputValue(activeCell.value ?? "");
    } else {
      setInputValue("");
    }
  }, [activeCell]);

  const handleKeyDown = (e) => {
    if (!activeCell) return;
    if (e.key === "Enter") {
      onSave(inputValue);
      e.target.blur();
    } else if (e.key === "Escape") {
      setInputValue(activeCell.value ?? "");
      e.target.blur();
    }
  };

  return (
    <div className="sheet-formula-bar">
      <div className="formula-bar-address" title="Cell Address">
        {activeCell?.address || ""}
      </div>
      <div className="formula-bar-fx" title="Formula">
        fx
      </div>
      <input
        type="text"
        className="formula-bar-input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          activeCell
            ? `Edit cell value here (Press Enter to save)...`
            : "Click any cell to edit its value..."
        }
        disabled={!activeCell}
      />
    </div>
  );
};

export default FormulaBar;
