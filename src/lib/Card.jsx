export function Card({ card, onRemove }) {
  return (
    <article className="kb-card">
      <h3 className="kb-card-title">{card.title}</h3>
      {card.note ? <p className="kb-card-note">{card.note}</p> : null}
      <button
        type="button"
        className="kb-card-remove"
        onClick={() => onRemove(card.id)}
      >
        Remove
      </button>
    </article>
  )
}
