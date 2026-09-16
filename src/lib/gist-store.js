const API = 'https://api.github.com'
const FILE = 'boards.json'
const HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

function authHeaders(token) {
  return {
    ...HEADERS,
    Authorization: `Bearer ${token}`,
  }
}

function gistError(status) {
  if (status === 401) return 'GitHub said that token is not allowed.'
  if (status === 403) return 'GitHub refused that request. Check the token scopes.'
  if (status === 404) return 'No gist with that id for this token.'
  return 'Could not reach your GitHub copy.'
}

export async function pullGist(token, gistId) {
  const res = await fetch(`${API}/gists/${gistId}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) return { ok: false, error: gistError(res.status) }
  const data = await res.json()
  const files = data.files || {}
  const file = files[FILE] || Object.values(files)[0]
  if (!file) return { ok: false, error: 'That gist has no board file.' }
  let text = file.content || ''
  if (file.truncated && file.raw_url) {
    const raw = await fetch(file.raw_url, { headers: authHeaders(token) })
    if (!raw.ok) return { ok: false, error: 'Could not read the gist file.' }
    text = await raw.text()
  }
  try {
    return { ok: true, gistId: data.id, data: JSON.parse(text) }
  } catch {
    return { ok: false, error: 'That gist is not JSON.' }
  }
}

export async function pushGist(token, gistId, workspace) {
  const payload = {
    description: 'Kanban boards',
    files: {
      [FILE]: { content: JSON.stringify(workspace, null, 2) },
    },
  }
  const creating = !gistId
  const res = await fetch(creating ? `${API}/gists` : `${API}/gists/${gistId}`, {
    method: creating ? 'POST' : 'PATCH',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(creating ? { ...payload, public: false } : payload),
  })
  if (!res.ok) return { ok: false, error: gistError(res.status) }
  const data = await res.json()
  return { ok: true, gistId: data.id }
}
