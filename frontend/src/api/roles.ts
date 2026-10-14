import { request } from './client'
import type { Role } from '../types'

export interface RolePayload {
  name: string
  description?: string | null
}

export function listRoles(): Promise<Role[]> {
  return request<Role[]>('/roles')
}

export function createRole(payload: RolePayload): Promise<Role> {
  return request<Role>('/roles', { method: 'POST', body: payload })
}

export function updateRole(id: number, payload: RolePayload): Promise<Role> {
  return request<Role>(`/roles/${id}`, { method: 'PUT', body: payload })
}

export function deleteRole(id: number): Promise<void> {
  return request<void>(`/roles/${id}`, { method: 'DELETE' })
}
