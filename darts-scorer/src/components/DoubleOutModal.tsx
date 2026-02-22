interface Props {
  score: number;
  playerName: string;
  onConfirm: (confirmed: boolean) => void;
}

export default function DoubleOutModal({ score, playerName, onConfirm }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">🎯</div>
        <h2>Checkout?</h2>
        <p>
          <strong>{playerName}</strong> scored{' '}
          <span className="modal-score">{score}</span>
          {' '}and landed on zero.
          <br />
          Did you finish on a double?
        </p>
        <div className="modal-actions">
          <button className="modal-btn-no" onClick={() => onConfirm(false)}>
            No (Bust)
          </button>
          <button className="modal-btn-yes" onClick={() => onConfirm(true)}>
            Yes!
          </button>
        </div>
      </div>
    </div>
  );
}
