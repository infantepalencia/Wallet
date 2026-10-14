import { request } from './client'
import type { CategoryReportItem, PeriodReportItem, SummaryReport, TotalReport } from '../types'

export function getTotalReport(): Promise<TotalReport> {
  return request<TotalReport>('/reports/total')
}

export function getByCategoryReport(): Promise<{ items: CategoryReportItem[] }> {
  return request<{ items: CategoryReportItem[] }>('/reports/by-category')
}

export function getByPeriodReport(): Promise<{ items: PeriodReportItem[] }> {
  return request<{ items: PeriodReportItem[] }>('/reports/by-period')
}

export function getSummaryReport(): Promise<SummaryReport> {
  return request<SummaryReport>('/reports/summary')
}
