import { request } from './client'
import type { TokenResponse, User } from '../types'

export interface RegisterPayload {
  email: string
  name: string
  phone?: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export function register(payload: RegisterPayload): Promise<User> {
  return request<User>('/auth/register', { method: 'POST', body: payload, auth: false })
}

export function login(payload: LoginPayload): Promise<TokenResponse> {
  return request<TokenResponse>('/auth/login', { method: 'POST', body: payload, auth: false })
}
