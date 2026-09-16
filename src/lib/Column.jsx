import { useState } from 'react'
import { Card } from './Card.jsx'

export function Column({ column, onAddCard, onRemoveCard }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [miss, setMiss] = useState('')

  function submit(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setMiss('Need a job title.')
      return
    }
    onAddCard(column.id, { title: trimmed, note: note.trim() })
    setTitle('')
    setNote('')
    setMiss('')
  }

  return (
    <section className="kb-column" aria-labelledby={`col-${column.id}`}>
      <header className="kb-column-head">
        <h2 id={`col-${column.id}`}>{column.title}</h2>
        <span className="kb-count">{column.cards.length}</span>
      </header>
      <div className="kb-cards">
        {column.cards.length === 0 ? (
          <p className="kb-empty">Nothing in this column.</p>
        ) : (
          column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onRemove={(cardId) => onRemoveCard(column.id, cardId)}
            />
          ))
        )}
      </div>
      <form className="kb-add" onSubmit={submit}>
        <label>
          Job
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Name, job"
          />
        </label>
        <label>
          Note
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Due date, who to call"
          />
        </label>
        {miss ? <p className="kb-miss">{miss}</p> : null}
        <button type="submit">Add card</button>
      </form>
    </section>
  )
}
