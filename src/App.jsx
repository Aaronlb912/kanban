import { useState } from 'react'
import { Workspace, normalizeWorkspace, sampleWorkspace } from './lib/index.js'

const STORAGE_KEY = 'kanban-workspace'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return normalizeWorkspace(sampleWorkspace)
    return normalizeWorkspace(JSON.parse(raw))
  } catch {
    return normalizeWorkspace(sampleWorkspace)
  }
}

function writeStored(workspace) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
  } catch {
    // Demo still runs if storage is blocked.
  }
}

export default function App() {
  const [workspace, setWorkspace] = useState(readStored)

  function change(next) {
    const normalized = normalizeWorkspace(next)
    setWorkspace(normalized)
    writeStored(normalized)
  }

  function resetSample() {
    if (!window.confirm('Replace stored boards with the North Loop sample?')) {
      return
    }
    change(normalizeWorkspace(sampleWorkspace))
  }

  return (
    <Workspace value={workspace} onChange={change} onResetSample={resetSample} />
  )
}
