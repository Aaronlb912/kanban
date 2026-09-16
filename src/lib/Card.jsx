export function Card({
  card,
  dragging,
  dropLine,
  onOpen,
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

  const body = card.body || card.note
  const done = (card.checklist || []).filter((item) => item.done).length
  const total = (card.checklist || []).length

  function open(event) {
    if (event.target.closest('button')) return
    onOpen(card.id)
  }

  return (
    <article
      className={className}
      draggable
      onClick={open}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <h3 className="kb-card-title">{card.title}</h3>
      {body ? <p className="kb-card-note">{body}</p> : null}
      {card.owner ? <p className="kb-card-meta">{card.owner}</p> : null}
      {card.due ? <p className="kb-card-meta">Due {card.due}</p> : null}
      {total > 0 ? (
        <p className="kb-card-meta">
          {done}/{total}
        </p>
      ) : null}
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
