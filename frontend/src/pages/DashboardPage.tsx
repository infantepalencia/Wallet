import { useEffect, useState } from 'react'
import { getSummaryReport } from '../api/reports'
import type { SummaryReport } from '../types'
import { ApiError } from '../api/client'

const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

export function DashboardPage() {
  const [summary, setSummary] = useState<SummaryReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSummaryReport()
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el resumen'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loading">Cargando resumen...</div>
  if (error) return <p className="error-text">{error}</p>
  if (!summary) return null

  const maxCategoryTotal = Math.max(1, ...summary.byCategory.map((c) => c.total))

  return (
    <div>
      <h2>Resumen de gastos</h2>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total gastado</div>
          <div className="stat-value">{currency.format(summary.total.total)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cantidad de gastos</div>
          <div className="stat-value">{summary.total.count}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categorías con gastos</div>
          <div className="stat-value">{summary.byCategory.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Periodos con gastos</div>
          <div className="stat-value">{summary.byPeriod.length}</div>
        </div>
      </div>

      <div className="form-card">
        <h3>Gastos por categoría</h3>
        {summary.byCategory.length === 0 ? (
          <p className="empty-state">Aún no hay gastos registrados.</p>
        ) : (
          <div className="bar-chart">
            {summary.byCategory.map((item) => (
              <div className="bar-row" key={item.categoryId}>
                <span>{item.categoryName}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(item.total / maxCategoryTotal) * 100}%` }} />
                </div>
                <span>{currency.format(item.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-card">
        <h3>Gastos por periodo</h3>
        {summary.byPeriod.length === 0 ? (
          <p className="empty-state">Aún no hay gastos registrados.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Gastos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.byPeriod.map((item) => (
                  <tr key={item.period}>
                    <td>{item.period}</td>
                    <td>{item.count}</td>
                    <td>{currency.format(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
