export function downloadBoard(board, filename = 'board.json') {
  const blob = new Blob([JSON.stringify(board, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function newId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}`
}

export function newCardId() {
  return newId('c')
}

export function newColumnId() {
  return newId('col')
}

export function parseBoard(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not JSON.' }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'That file is not a board.' }
  }
  if (!Array.isArray(data.columns)) {
    return { ok: false, error: 'That file is not a board.' }
  }

  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const note = typeof data.note === 'string' ? data.note : ''
  const columns = []

  for (const raw of data.columns) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ok: false, error: 'A column in that file is not a column.' }
    }
    const colTitle = typeof raw.title === 'string' ? raw.title.trim() : ''
    if (!colTitle) {
      return { ok: false, error: 'A column needs a name.' }
    }
    const cardsRaw = Array.isArray(raw.cards) ? raw.cards : []
    const cards = []
    for (const card of cardsRaw) {
      if (!card || typeof card !== 'object' || Array.isArray(card)) {
        return { ok: false, error: 'A card in that file is not a card.' }
      }
      const cardTitle = typeof card.title === 'string' ? card.title.trim() : ''
      if (!cardTitle) {
        return { ok: false, error: 'A card needs a title.' }
      }
      cards.push({
        id: typeof card.id === 'string' && card.id ? card.id : newCardId(),
        title: cardTitle,
        note: typeof card.note === 'string' ? card.note : '',
      })
    }
    columns.push({
      id: typeof raw.id === 'string' && raw.id ? raw.id : newColumnId(),
      title: colTitle,
      cards,
    })
  }

  return {
    ok: true,
    board: {
      title: title || 'Board',
      note,
      columns,
    },
  }
}

export function moveCard(board, fromColumnId, cardId, toColumnId, toIndex) {
  const fromCol = board.columns.find((column) => column.id === fromColumnId)
  const toCol = board.columns.find((column) => column.id === toColumnId)
  if (!fromCol || !toCol) return board

  const fromIndex = fromCol.cards.findIndex((card) => card.id === cardId)
  if (fromIndex < 0) return board

  const card = fromCol.cards[fromIndex]
  const columns = board.columns.map((column) => ({
    ...column,
    cards: [...column.cards],
  }))
  const nextFrom = columns.find((column) => column.id === fromColumnId)
  const nextTo = columns.find((column) => column.id === toColumnId)
  nextFrom.cards.splice(fromIndex, 1)

  let insertAt = toIndex
  if (fromColumnId === toColumnId && fromIndex < toIndex) {
    insertAt -= 1
  }
  if (insertAt < 0) insertAt = 0
  if (insertAt > nextTo.cards.length) insertAt = nextTo.cards.length
  nextTo.cards.splice(insertAt, 0, card)

  return { ...board, columns }
}
