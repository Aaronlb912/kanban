import { useEffect, useState } from 'react'
import { Card } from './Card.jsx'
import { COLUMN_COLORS, normalizeColor } from './board-json.js'

export function Column({
  column,
  cards,
  filtering,
  dragId,
  colDragId,
  over,
  colOver,
  onRemoveCard,
  onRemoveColumn,
  onRename,
  onColor,
  onOpenCard,
  onCloseCard,
  onDragStart,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onDragOverCard,
  onDragOverColumn,
  onDropCard,
  onDropColumn,
  onDragEnd,
}) {
  const visible = cards || column.cards
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(column.title)

  useEffect(() => {
    setTitle(column.title)
  }, [column.title])

  function commitTitle() {
    const trimmed = title.trim()
    if (!trimmed) {
      setTitle(column.title)
      onRename(column.id, '')
      return
    }
    if (trimmed !== column.title) onRename(column.id, trimmed)
    setEditing(false)
  }

  function cancelEdit() {
    setTitle(column.title)
    setEditing(false)
  }

  const dropOnEnd =
    !filtering &&
    over &&
    over.columnId === column.id &&
    over.index === column.cards.length

  const color = normalizeColor(column.color)
  const className = [
    'kb-column',
    over && over.columnId === column.id ? 'kb-column-over' : '',
    colDragId === column.id ? 'kb-dragging' : '',
    colOver && colOver.columnId === column.id
      ? colOver.before
        ? 'kb-col-drop-before'
        : 'kb-col-drop-after'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={className}
      style={{ '--kb-col': color }}
      aria-label={column.title}
      onDragOver={(event) => onColumnDragOver(event, column.id)}
      onDrop={(event) => onColumnDrop(event, column.id)}
    >
      <header
        className="kb-column-head"
        draggable={!editing}
        onDragStart={(event) => onColumnDragStart(event, column.id)}
        onDragEnd={onDragEnd}
      >
        {editing ? (
          <div className="kb-column-edit">
            <label className="kb-column-title">
              Column name
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commitTitle()
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    cancelEdit()
                  }
                }}
              />
            </label>
            <label className="kb-color">
              Color
              <select
                value={color}
                onChange={(event) => onColor(column.id, event.target.value)}
              >
                {COLUMN_COLORS.map((item) => (
                  <option key={item.hex} value={item.hex}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="kb-actions">
              <button type="button" onClick={commitTitle}>
                Save
              </button>
              <button type="button" className="kb-btn-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="kb-column-name">
              <h2>{column.title}</h2>
              <span className="kb-count">
                {filtering
                  ? `${visible.length} / ${column.cards.length}`
                  : column.cards.length}
              </span>
            </div>
            <div className="kb-column-tools">
              <button
                type="button"
                className="kb-quiet"
                onClick={() => {
                  setTitle(column.title)
                  setEditing(true)
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="kb-quiet"
                onClick={() => onRemoveColumn(column.id)}
              >
                Remove
              </button>
            </div>
          </>
        )}
      </header>
      <div
        className="kb-cards"
        onDragOver={(event) => onDragOverColumn(event, column.id)}
        onDrop={(event) => onDropColumn(event, column.id)}
      >
        {visible.length === 0 ? (
          <p className="kb-empty">
            {filtering ? 'Nothing matches.' : 'Nothing in this column.'}
          </p>
        ) : (
          visible.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              dragging={dragId === card.id}
              dropLine={
                !filtering &&
                over &&
                over.columnId === column.id &&
                over.index === index
                  ? 'before'
                  : ''
              }
              lockDrag={filtering}
              onRemove={(cardId) => onRemoveCard(column.id, cardId)}
              onOpen={(cardId) => onOpenCard(column.id, cardId)}
              onClose={onCloseCard ? (cardId) => onCloseCard(column.id, cardId) : undefined}
              onDragStart={(event) => onDragStart(event, column.id, card.id)}
              onDragOver={(event) => onDragOverCard(event, column.id, index)}
              onDrop={(event) => onDropCard(event, column.id, index)}
              onDragEnd={onDragEnd}
            />
          ))
        )}
        {dropOnEnd && column.cards.length > 0 ? (
          <div className="kb-drop-end" />
        ) : null}
      </div>
    </section>
  )
}
