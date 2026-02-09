const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function submitIntent(query: string) {
  const response = await fetch(`${API_URL}/api/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  return response.json()
}

export async function approveAction(id: string) {
  const response = await fetch(`${API_URL}/api/actions/${id}/approve`, {
    method: 'POST',
  })
  return response.json()
}

export async function rejectAction(id: string) {
  const response = await fetch(`${API_URL}/api/actions/${id}/reject`, {
    method: 'POST',
  })
  return response.json()
}

export async function getCurrentContext() {
  const response = await fetch(`${API_URL}/api/context/current`)
  return response.json()
}

export async function getAgentStatus() {
  const response = await fetch(`${API_URL}/api/agents/status`)
  return response.json()
}
