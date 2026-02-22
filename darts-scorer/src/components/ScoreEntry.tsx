import { useState, useEffect, useCallback } from 'react';

interface Props {
  onSubmit: (score: number) => void;
  maxScore: number; // remaining points for current player
}

export default function ScoreEntry({ onSubmit }: Props) {
  const [input, setInput] = useState('');

  const numericValue = input === '' ? null : parseInt(input, 10);

  function pressDigit(digit: string) {
    setInput((prev) => {
      const next = prev + digit;
      if (parseInt(next, 10) > 180) return prev; // cap at 180
      return next;
    });
  }

  function pressBackspace() {
    setInput((prev) => prev.slice(0, -1));
  }

  function pressClear() {
    setInput('');
  }

  function handleSubmit() {
    if (numericValue === null) return;
    onSubmit(numericValue);
    setInput('');
  }

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        pressDigit(e.key);
      } else if (e.key === 'Backspace') {
        pressBackspace();
      } else if (e.key === 'Escape') {
        pressClear();
      } else if (e.key === 'Enter') {
        if (numericValue !== null) {
          onSubmit(numericValue);
          setInput('');
        }
      }
    },
    [numericValue, onSubmit]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="score-entry">
      <div className="score-display">
        <div className="entered-score">
          {input === '' ? <span style={{ color: 'var(--text-muted)' }}>–</span> : input}
        </div>
        <div className="score-hint">Enter score (0–180)</div>
      </div>

      <div className="numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} className="numpad-btn" onClick={() => pressDigit(String(d))}>
            {d}
          </button>
        ))}
        <button className="numpad-btn clear" onClick={pressClear}>
          C
        </button>
        <button className="numpad-btn zero" onClick={() => pressDigit('0')}>
          0
        </button>
        <button className="numpad-btn backspace" onClick={pressBackspace}>
          ⌫
        </button>
      </div>

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={numericValue === null}
      >
        Submit
      </button>
    </div>
  );
}
