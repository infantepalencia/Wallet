import { request } from './client'
import type { User } from '../types'

export interface UpdateProfilePayload {
  email?: string
  name?: string
  phone?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface CreateUserPayload {
  email: string
  name: string
  phone?: string
  password: string
  roleId: number
}

export function getMe(): Promise<User> {
  return request<User>('/users/me')
}

export function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  return request<User>('/users/me', { method: 'PUT', body: payload })
}

export function changePassword(payload: ChangePasswordPayload): Promise<void> {
  return request<void>('/users/me/change-password', { method: 'POST', body: payload })
}

export function listUsers(): Promise<User[]> {
  return request<User[]>('/users')
}

export function createUser(payload: CreateUserPayload): Promise<User> {
  return request<User>('/users', { method: 'POST', body: payload })
}

export function adminUpdateUser(userId: number, payload: UpdateProfilePayload): Promise<User> {
  return request<User>(`/users/${userId}`, { method: 'PUT', body: payload })
}

export function deleteUser(userId: number): Promise<void> {
  return request<void>(`/users/${userId}`, { method: 'DELETE' })
}

export function updateUserRole(userId: number, roleId: number): Promise<User> {
  return request<User>(`/users/${userId}/role`, { method: 'PUT', body: { roleId } })
}

export function updateUserStatus(userId: number, active: boolean): Promise<User> {
  return request<User>(`/users/${userId}/status`, { method: 'PUT', body: { active } })
}
