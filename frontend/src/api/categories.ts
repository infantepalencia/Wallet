import { request } from './client'
import type { Category } from '../types'

export interface CategoryPayload {
  name: string
  description?: string | null
  active: boolean
}

export function listCategories(): Promise<Category[]> {
  return request<Category[]>('/categories')
}

export function createCategory(payload: CategoryPayload): Promise<Category> {
  return request<Category>('/categories', { method: 'POST', body: payload })
}

export function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  return request<Category>(`/categories/${id}`, { method: 'PUT', body: payload })
}

export function deleteCategory(id: number): Promise<void> {
  return request<void>(`/categories/${id}`, { method: 'DELETE' })
}
