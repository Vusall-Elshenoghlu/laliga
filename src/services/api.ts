/**
 * Tiny fetch wrapper for the future backend.
 *
 * Set the base URL in an `.env` file at the project root:
 *   VITE_API_URL=https://api.laliga.az
 * While it is empty, services fall back to the static data bundled with the app.
 */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export const hasApi = () => API_URL.length > 0

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) throw new ApiError(res.status, `GET ${path} failed with ${res.status}`)
  return (await res.json()) as T
}
