export function Card({
  card,
  dragging,
  dropLine,
  lockDrag,
  onOpen,
  onClose,
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
    lockDrag ? 'kb-card-still' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const body = card.body || card.note
  const done = (card.checklist || []).filter((item) => item.done).length
  const total = (card.checklist || []).length

  return (
    <article
      className={className}
      draggable={!lockDrag}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="kb-card-head">
        <h3 className="kb-card-title">{card.title}</h3>
        <div className="kb-card-actions">
          <button type="button" className="kb-quiet" onClick={() => onOpen(card.id)}>
            Edit
          </button>
          {onClose ? (
            <button type="button" className="kb-quiet" onClick={() => onClose(card.id)}>
              Close out
            </button>
          ) : null}
          <button
            type="button"
            className="kb-quiet"
            onClick={() => onRemove(card.id)}
          >
            Remove
          </button>
        </div>
      </div>
      {card.badges && card.badges.length > 0 ? (
        <ul className="kb-card-badges">
          {card.badges.map((badge) => (
            <li key={badge.id}>{badge.label}</li>
          ))}
        </ul>
      ) : null}
      {body ? <p className="kb-card-note">{body}</p> : null}
      {card.due ? <p className="kb-card-due">Due {card.due}</p> : null}
      {card.owner ? <p className="kb-card-meta">{card.owner}</p> : null}
      {total > 0 ? (
        <p className="kb-card-meta">
          {done} / {total}
        </p>
      ) : null}
    </article>
  )
}
