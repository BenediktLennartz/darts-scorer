import { useRef, useEffect } from 'react';

interface Props {
  onSubmit: (score: number) => void;
  currentPlayerName: string;
}

export default function ScoreEntry({ onSubmit, currentPlayerName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input whenever it mounts or player changes
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [currentPlayerName]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit();
    }
  }

  function submit() {
    const val = inputRef.current?.value;
    if (val === '' || val === undefined) return;
    const score = parseInt(val, 10);
    if (isNaN(score) || score < 0 || score > 180) return;
    onSubmit(score);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    inputRef.current?.focus();
  }

  return (
    <div className="score-input-row">
      <input
        ref={inputRef}
        type="number"
        className="score-input"
        placeholder="0"
        min={0}
        max={180}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <button className="score-submit-btn" onClick={submit}>
        Submit
      </button>
    </div>
  );
}
