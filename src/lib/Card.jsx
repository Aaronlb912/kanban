export function Card({
  card,
  dragging,
  dropLine,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const className = [
    'kb-card',
    dragging ? 'kb-dragging' : '',
    dropLine === 'before' ? 'kb-drop-before' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <article
      className={className}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
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
