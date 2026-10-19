/**
 * Form submissions (booking, contact, job application) → the admin panel.
 *
 * With VITE_API_URL set: POST {API_URL}/forms/{kind} as multipart/form-data
 * (fields + an optional `cv` file). The backend should answer 2xx with `{ id }`.
 *
 * Without an API (this concept): the submission is kept in localStorage ("laliga.outbox") and
 * reported as sent after a short delay, so the whole flow can be tried. Connect the backend before launch.
 */
import { API_URL, hasApi } from './api'

export type FormKind = 'booking' | 'contact' | 'job'
export type FormResult = { id: string }

export const isDemoForms = () => !hasApi()

export async function submitForm(kind: FormKind, fields: Record<string, string>, file?: File | null): Promise<FormResult> {
  if (hasApi()) {
    const body = new FormData()
    Object.entries(fields).forEach(([k, v]) => body.append(k, v))
    if (file) body.append('cv', file, file.name)
    const res = await fetch(`${API_URL}/forms/${kind}`, { method: 'POST', body })
    if (!res.ok) throw new Error(`POST /forms/${kind} failed with ${res.status}`)
    return (await res.json().catch(() => ({ id: '' }))) as FormResult
  }
  await new Promise((r) => setTimeout(r, 900))
  const id = `${kind}-${Date.now().toString(36)}`
  try {
    const box = JSON.parse(localStorage.getItem('laliga.outbox') ?? '[]')
    box.push({ id, kind, fields, file: file ? { name: file.name, size: file.size } : null, at: new Date().toISOString() })
    localStorage.setItem('laliga.outbox', JSON.stringify(box.slice(-50)))
  } catch { /* storage blocked — still fine for the demo */ }
  return { id }
}

/** CV rules */
export const CV_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export const CV_MAX = 5 * 1024 * 1024
export const cvOk = (f: File) => /\.(pdf|docx?)$/i.test(f.name) && f.size <= CV_MAX
