import { request } from './client'
import type { Expense } from '../types'

export interface ExpensePayload {
  description: string
  amount: number
  date: string
  categoryId: number
}

export interface ExpenseFilters {
  categoryId?: number
  date?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  [key: string]: string | number | undefined
}

export function listExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  return request<Expense[]>('/expenses', { params: filters })
}

export function listAllExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  return request<Expense[]>('/expenses/all', { params: filters })
}

export function createExpense(payload: ExpensePayload): Promise<Expense> {
  return request<Expense>('/expenses', { method: 'POST', body: payload })
}

export function updateExpense(id: number, payload: Partial<ExpensePayload>): Promise<Expense> {
  return request<Expense>(`/expenses/${id}`, { method: 'PUT', body: payload })
}

export function deleteExpense(id: number): Promise<void> {
  return request<void>(`/expenses/${id}`, { method: 'DELETE' })
}
