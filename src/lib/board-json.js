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

export function newBadgeId() {
  return newId('b')
}

export function newCheckId() {
  return newId('ch')
}

export function newBoardId() {
  return newId('board')
}

export const COLUMN_COLORS = [
  { id: 'ink', name: 'Ink', hex: '#2c3a32' },
  { id: 'ochre', name: 'Ochre', hex: '#8a6a2a' },
  { id: 'clay', name: 'Clay', hex: '#7a3b2e' },
  { id: 'moss', name: 'Moss', hex: '#3d5a45' },
  { id: 'slate', name: 'Slate', hex: '#4a5560' },
  { id: 'plum', name: 'Plum', hex: '#5c3d5e' },
]

const DEFAULT_COLOR = COLUMN_COLORS[0].hex

export function normalizeColor(value) {
  if (typeof value !== 'string' || !value) return DEFAULT_COLOR
  const trimmed = value.trim().toLowerCase()
  const byId = COLUMN_COLORS.find((item) => item.id === trimmed)
  if (byId) return byId.hex
  const byHex = COLUMN_COLORS.find((item) => item.hex.toLowerCase() === trimmed)
  if (byHex) return byHex.hex
  return DEFAULT_COLOR
}

export function nextColumnColor(columns) {
  const used = new Set((columns || []).map((column) => normalizeColor(column.color)))
  const unused = COLUMN_COLORS.find((item) => !used.has(item.hex))
  return unused ? unused.hex : COLUMN_COLORS[columns.length % COLUMN_COLORS.length].hex
}

function normalizeColumn(raw) {
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : newColumnId(),
    title: typeof raw.title === 'string' ? raw.title.trim() : '',
    color: normalizeColor(raw.color),
    cards: Array.isArray(raw.cards)
      ? raw.cards
          .filter((card) => card && typeof card === 'object' && !Array.isArray(card))
          .map((card) => normalizeCard(card))
      : [],
  }
}

export function normalizeCard(raw) {
  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  const note = typeof raw.note === 'string' ? raw.note : ''
  const bodyRaw = typeof raw.body === 'string' ? raw.body : ''
  const body = bodyRaw.trim() ? bodyRaw : note
  const badges = Array.isArray(raw.badges)
    ? raw.badges
        .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
        .map((item) => ({
          id: typeof item.id === 'string' && item.id ? item.id : newBadgeId(),
          label: typeof item.label === 'string' ? item.label.trim() : '',
        }))
        .filter((item) => item.label)
    : []
  const checklist = Array.isArray(raw.checklist)
    ? raw.checklist
        .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
        .map((item) => ({
          id: typeof item.id === 'string' && item.id ? item.id : newCheckId(),
          text: typeof item.text === 'string' ? item.text.trim() : '',
          done: Boolean(item.done),
        }))
        .filter((item) => item.text)
    : []

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : newCardId(),
    title,
    body,
    note: body,
    owner: typeof raw.owner === 'string' ? raw.owner : '',
    due: typeof raw.due === 'string' ? raw.due : '',
    badges,
    checklist,
  }
}

export function normalizeBoard(raw) {
  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  const note = typeof raw.note === 'string' ? raw.note : ''
  const columns = Array.isArray(raw.columns)
    ? raw.columns
        .filter((column) => column && typeof column === 'object' && !Array.isArray(column))
        .map((column) => normalizeColumn(column))
        .filter((column) => column.title)
    : []

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : newBoardId(),
    title: title || 'Board',
    note,
    columns,
  }
}

export function blankBoard(title) {
  return normalizeBoard({
    title,
    note: '',
    columns: [
      { title: 'To do', color: COLUMN_COLORS[0].hex, cards: [] },
      { title: 'In progress', color: COLUMN_COLORS[1].hex, cards: [] },
      { title: 'Done', color: COLUMN_COLORS[3].hex, cards: [] },
    ],
  })
}

export function cloneCard(card) {
  const src = normalizeCard(card)
  return {
    ...src,
    id: newCardId(),
    title: `${src.title} copy`,
    badges: src.badges.map((badge) => ({ ...badge, id: newBadgeId() })),
    checklist: src.checklist.map((item) => ({ ...item, id: newCheckId() })),
  }
}

export function cloneBoard(board) {
  const src = normalizeBoard(board)
  return {
    ...src,
    id: newBoardId(),
    title: `${src.title} copy`,
    columns: src.columns.map((column) => ({
      ...column,
      id: newColumnId(),
      cards: column.cards.map((card) => ({
        ...card,
        id: newCardId(),
        badges: card.badges.map((badge) => ({ ...badge, id: newBadgeId() })),
        checklist: card.checklist.map((item) => ({ ...item, id: newCheckId() })),
      })),
    })),
  }
}

export function downloadWorkspace(workspace, filename = 'boards.json') {
  downloadBoard(
    {
      activeBoardId: workspace.activeBoardId,
      boards: workspace.boards,
    },
    filename,
  )
}

export function cardMatches(card, query, badge) {
  if (badge) {
    const has = (card.badges || []).some((item) => item.label === badge)
    if (!has) return false
  }
  const q = (query || '').trim().toLowerCase()
  if (!q) return true
  const parts = [
    card.title,
    card.body,
    card.owner,
    ...(card.badges || []).map((item) => item.label),
  ]
  return parts.join(' ').toLowerCase().includes(q)
}

export function boardBadges(board) {
  const seen = new Set()
  const labels = []
  for (const column of board.columns || []) {
    for (const card of column.cards || []) {
      for (const badge of card.badges || []) {
        if (!badge.label || seen.has(badge.label)) continue
        seen.add(badge.label)
        labels.push(badge.label)
      }
    }
  }
  return labels
}

export function moveColumn(board, columnId, dir) {
  const index = board.columns.findIndex((column) => column.id === columnId)
  const next = index + dir
  if (index < 0 || next < 0 || next >= board.columns.length) return board
  const columns = [...board.columns]
  const [column] = columns.splice(index, 1)
  columns.splice(next, 0, column)
  return { ...board, columns }
}

export function normalizeWorkspace(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    const board = blankBoard('Board')
    return { boards: [board], activeBoardId: board.id }
  }

  let boards = []
  if (Array.isArray(raw.boards)) {
    boards = raw.boards
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => normalizeBoard(item))
  } else if (Array.isArray(raw.columns)) {
    boards = [normalizeBoard(raw)]
  }

  if (boards.length === 0) {
    boards = [blankBoard('Board')]
  }

  const active =
    boards.find((item) => item.id === raw.activeBoardId) || boards[0]
  return { boards, activeBoardId: active.id }
}

export function cardCount(board) {
  return (board.columns || []).reduce((n, column) => n + column.cards.length, 0)
}

function parseBoardObject(data) {
  if (!Array.isArray(data.columns)) {
    return { ok: false, error: 'That file is not a board.' }
  }

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
      const normalized = normalizeCard(card)
      if (!normalized.title) {
        return { ok: false, error: 'A card needs a title.' }
      }
      cards.push(normalized)
    }
    columns.push({
      id: typeof raw.id === 'string' && raw.id ? raw.id : newColumnId(),
      title: colTitle,
      color: normalizeColor(raw.color),
      cards,
    })
  }

  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const note = typeof data.note === 'string' ? data.note : ''
  return {
    ok: true,
    board: {
      id: typeof data.id === 'string' && data.id ? data.id : newBoardId(),
      title: title || 'Board',
      note,
      columns,
    },
  }
}

export function parseFile(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not JSON.' }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'That file is not a board.' }
  }

  if (Array.isArray(data.boards)) {
    if (data.boards.length === 0) {
      return { ok: false, error: 'That file has no boards.' }
    }
    const boards = []
    for (const item of data.boards) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { ok: false, error: 'That file is not a board.' }
      }
      const one = parseBoardObject(item)
      if (!one.ok) return one
      boards.push(one.board)
    }
    const active =
      boards.find((item) => item.id === data.activeBoardId) || boards[0]
    return {
      ok: true,
      kind: 'workspace',
      workspace: { boards, activeBoardId: active.id },
    }
  }

  const one = parseBoardObject(data)
  if (!one.ok) return one
  return { ok: true, kind: 'board', board: one.board }
}

export function parseBoard(text) {
  const parsed = parseFile(text)
  if (!parsed.ok) return parsed
  if (parsed.kind === 'workspace') {
    const board =
      parsed.workspace.boards.find(
        (item) => item.id === parsed.workspace.activeBoardId,
      ) || parsed.workspace.boards[0]
    return { ok: true, board }
  }
  return { ok: true, board: parsed.board }
}

export function updateCard(board, columnId, card) {
  return {
    ...board,
    columns: board.columns.map((column) => {
      if (column.id !== columnId) return column
      return {
        ...column,
        cards: column.cards.map((item) => (item.id === card.id ? card : item)),
      }
    }),
  }
}

export function findCard(board, cardId) {
  for (const column of board.columns) {
    const card = column.cards.find((item) => item.id === cardId)
    if (card) return { column, card }
  }
  return null
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
