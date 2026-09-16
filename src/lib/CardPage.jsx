import { useEffect, useState } from 'react'
import { newBadgeId, newCheckId, normalizeCard } from './board-json.js'

export function CardPage({
  board,
  columnId,
  card,
  mode,
  closed,
  onSave,
  onCancel,
  onRemove,
  onDuplicate,
  onClose,
  onReopen,
}) {
  const isNew = mode === 'new'
  const [title, setTitle] = useState(card.title)
  const [body, setBody] = useState(card.body || '')
  const [owner, setOwner] = useState(card.owner || '')
  const [due, setDue] = useState(card.due || '')
  const [badges, setBadges] = useState(card.badges || [])
  const [checklist, setChecklist] = useState(card.checklist || [])
  const [badgeLabel, setBadgeLabel] = useState('')
  const [checkText, setCheckText] = useState('')
  const [nextColumnId, setNextColumnId] = useState(columnId)
  const [miss, setMiss] = useState('')

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function addBadge(event) {
    event.preventDefault()
    const label = badgeLabel.trim()
    if (!label) {
      setMiss('Need a badge name.')
      return
    }
    setBadges([...badges, { id: newBadgeId(), label }])
    setBadgeLabel('')
    setMiss('')
  }

  function addCheck(event) {
    event.preventDefault()
    const text = checkText.trim()
    if (!text) {
      setMiss('Need a checklist line.')
      return
    }
    setChecklist([...checklist, { id: newCheckId(), text, done: false }])
    setCheckText('')
    setMiss('')
  }

  function builtCard() {
    const trimmed = title.trim()
    if (!trimmed) {
      setMiss('Need a job title.')
      return null
    }
    if (board.columns.length === 0) {
      setMiss('Add a column first.')
      return null
    }
    if (!nextColumnId) {
      setMiss('Pick a column.')
      return null
    }
    setMiss('')
    return normalizeCard({
      ...card,
      title: trimmed,
      body: body.trim(),
      owner: owner.trim(),
      due: due.trim(),
      badges,
      checklist,
    })
  }

  function save(event) {
    event.preventDefault()
    const next = builtCard()
    if (!next) return
    onSave(next, nextColumnId)
  }

  function closeOut() {
    const next = builtCard()
    if (!next) return
    onClose(next, nextColumnId)
  }

  function putBack() {
    const next = builtCard()
    if (!next) return
    onReopen(next, nextColumnId)
  }

  return (
    <div className="kb kb-page">
      <p className="kb-kicker">
        {isNew ? 'Add card' : closed ? 'Closed job' : 'Edit card'}
      </p>
      <h1>{isNew ? 'New card' : card.title}</h1>
      <p className="kb-hint">
        {isNew
          ? 'Fill the job, pick a column, then save. Escape goes back.'
          : closed
            ? 'This job is off the board. Search still finds it. Put it back if it is not done.'
            : 'Change the job, then save. Close out when the work is finished.'}
      </p>
      {miss ? <p className="kb-miss">{miss}</p> : null}
      <form className="kb-card-form" onSubmit={save}>
        <label>
          Job
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          Details
          <textarea
            rows={5}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
        <div className="kb-card-form-row">
          <label>
            Owner
            <input
              value={owner}
              onChange={(event) => setOwner(event.target.value)}
              placeholder="Who has it"
            />
          </label>
          <label>
            Due
            <input
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
          </label>
        </div>
        <label>
          {closed ? 'Put back in' : 'Column'}
          <select
            value={nextColumnId}
            onChange={(event) => setNextColumnId(event.target.value)}
          >
            {board.columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="kb-fieldset">
          <legend>Badges</legend>
          {badges.length === 0 ? <p className="kb-empty">No badges.</p> : null}
          <ul className="kb-badge-list">
            {badges.map((badge) => (
              <li key={badge.id}>
                <span className="kb-badge">{badge.label}</span>
                <button
                  type="button"
                  className="kb-quiet"
                  onClick={() => setBadges(badges.filter((item) => item.id !== badge.id))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="kb-inline">
            <input
              value={badgeLabel}
              onChange={(event) => setBadgeLabel(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addBadge(event)
                }
              }}
              placeholder="rush, paid"
            />
            <button type="button" className="kb-btn-ghost" onClick={addBadge}>
              Add badge
            </button>
          </div>
        </fieldset>
        <fieldset className="kb-fieldset">
          <legend>Checklist</legend>
          {checklist.length === 0 ? <p className="kb-empty">No checklist.</p> : null}
          <ul className="kb-check-list">
            {checklist.map((item) => (
              <li key={item.id}>
                <label className="kb-check-row">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() =>
                      setChecklist(
                        checklist.map((row) =>
                          row.id === item.id ? { ...row, done: !row.done } : row,
                        ),
                      )
                    }
                  />
                  <span>{item.text}</span>
                </label>
                <button
                  type="button"
                  className="kb-quiet"
                  onClick={() =>
                    setChecklist(checklist.filter((row) => row.id !== item.id))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="kb-inline">
            <input
              value={checkText}
              onChange={(event) => setCheckText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addCheck(event)
                }
              }}
              placeholder="A step"
            />
            <button type="button" className="kb-btn-ghost" onClick={addCheck}>
              Add step
            </button>
          </div>
        </fieldset>
        <div className="kb-actions">
          <button type="submit">Save</button>
          <button type="button" className="kb-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          {isNew ? null : (
            <button type="button" className="kb-btn-ghost" onClick={onDuplicate}>
              Duplicate card
            </button>
          )}
          {isNew ? null : closed ? (
            <button type="button" onClick={putBack}>
              Put back
            </button>
          ) : (
            <button type="button" className="kb-btn-ghost" onClick={closeOut}>
              Close out
            </button>
          )}
          {isNew ? null : (
            <button type="button" className="kb-quiet" onClick={() => onRemove(card.id)}>
              Remove card
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
