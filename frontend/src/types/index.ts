export interface Role {
  id: number
  name: string
  description: string | null
}

export interface User {
  id: number
  email: string
  name: string
  phone: string | null
  active: boolean
  role: Role
  createdAt: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  active: boolean
}

export interface Expense {
  id: number
  description: string
  amount: number
  date: string
  userId: number
  category: Category
  createdAt: string
  updatedAt: string
}

export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface TotalReport {
  total: number
  count: number
}

export interface CategoryReportItem {
  categoryId: number
  categoryName: string
  total: number
  count: number
}

export interface PeriodReportItem {
  period: string
  total: number
  count: number
}

export interface SummaryReport {
  total: TotalReport
  byCategory: CategoryReportItem[]
  byPeriod: PeriodReportItem[]
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}
