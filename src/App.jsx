import { useEffect, useRef, useState } from 'react'
import { Workspace, normalizeWorkspace, sampleWorkspace } from './lib/index.js'
import { pullGist, pushGist } from './lib/gist-store.js'

const STORAGE_KEY = 'kanban-workspace'
const CLOUD_KEY = 'kanban-gist'

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

function readCloud() {
  try {
    const raw = localStorage.getItem(CLOUD_KEY)
    if (!raw) return { token: '', gistId: '' }
    const data = JSON.parse(raw)
    return {
      token: typeof data.token === 'string' ? data.token : '',
      gistId: typeof data.gistId === 'string' ? data.gistId : '',
    }
  } catch {
    return { token: '', gistId: '' }
  }
}

function writeCloud(cloud) {
  try {
    localStorage.setItem(CLOUD_KEY, JSON.stringify(cloud))
  } catch {
    // Token stays in memory for this tab.
  }
}

export default function App() {
  const [workspace, setWorkspace] = useState(readStored)
  const [cloud, setCloud] = useState(readCloud)
  const [cloudNote, setCloudNote] = useState('')
  const [cloudMiss, setCloudMiss] = useState('')
  const pending = useRef(null)
  const timer = useRef(null)
  const cloudRef = useRef(cloud)
  cloudRef.current = cloud

  useEffect(() => {
    const { token, gistId } = readCloud()
    if (!token || !gistId) return
    let gone = false
    setCloudNote('Loading your GitHub copy.')
    pullGist(token, gistId).then((result) => {
      if (gone) return
      if (!result.ok) {
        setCloudMiss(result.error)
        setCloudNote('')
        return
      }
      const next = normalizeWorkspace(result.data)
      setWorkspace(next)
      writeStored(next)
      setCloudMiss('')
      setCloudNote('Using your GitHub copy.')
    })
    return () => {
      gone = true
    }
  }, [])

  function persistCloud(nextCloud) {
    setCloud(nextCloud)
    writeCloud(nextCloud)
  }

  function change(next) {
    const normalized = normalizeWorkspace(next)
    setWorkspace(normalized)
    writeStored(normalized)
    pending.current = normalized
    if (timer.current) clearTimeout(timer.current)
    const { token, gistId } = cloudRef.current
    if (!token || !gistId) return
    timer.current = setTimeout(() => {
      const body = pending.current
      if (!body) return
      setCloudNote('Saving to GitHub.')
      pushGist(token, gistId, body).then((result) => {
        if (!result.ok) {
          setCloudMiss(result.error)
          setCloudNote('')
          return
        }
        setCloudMiss('')
        setCloudNote('Saved to GitHub.')
      })
    }, 800)
  }

  async function connectCloud(token, gistId) {
    const trimmedToken = token.trim()
    const trimmedGist = gistId.trim()
    if (!trimmedToken) {
      setCloudMiss('Need a GitHub token with Gist access.')
      return
    }
    setCloudMiss('')
    if (trimmedGist) {
      const pulled = await pullGist(trimmedToken, trimmedGist)
      if (!pulled.ok) {
        setCloudMiss(pulled.error)
        return
      }
      persistCloud({ token: trimmedToken, gistId: pulled.gistId })
      const next = normalizeWorkspace(pulled.data)
      setWorkspace(next)
      writeStored(next)
      setCloudNote('Using your GitHub copy.')
      return
    }
    const pushed = await pushGist(trimmedToken, '', workspace)
    if (!pushed.ok) {
      setCloudMiss(pushed.error)
      return
    }
    persistCloud({ token: trimmedToken, gistId: pushed.gistId })
    setCloudNote('Saved a private gist. Use that gist id on your other devices.')
  }

  async function pullCloud() {
    const { token, gistId } = cloudRef.current
    if (!token || !gistId) {
      setCloudMiss('Connect a GitHub gist first.')
      return
    }
    const pulled = await pullGist(token, gistId)
    if (!pulled.ok) {
      setCloudMiss(pulled.error)
      return
    }
    const next = normalizeWorkspace(pulled.data)
    setWorkspace(next)
    writeStored(next)
    setCloudMiss('')
    setCloudNote('Loaded from GitHub.')
  }

  function forgetCloud() {
    persistCloud({ token: '', gistId: '' })
    setCloudNote('This browser is local only now.')
    setCloudMiss('')
  }

  function resetSample() {
    if (!window.confirm('Replace stored boards with the North Loop sample?')) {
      return
    }
    change(normalizeWorkspace(sampleWorkspace))
  }

  return (
    <Workspace
      value={workspace}
      onChange={change}
      onResetSample={resetSample}
      cloud={cloud}
      cloudNote={cloudNote}
      cloudMiss={cloudMiss}
      onConnectCloud={connectCloud}
      onPullCloud={pullCloud}
      onForgetCloud={forgetCloud}
    />
  )
}
