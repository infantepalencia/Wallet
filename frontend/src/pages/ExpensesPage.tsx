import { useEffect, useState, type FormEvent } from 'react'
import * as expensesApi from '../api/expenses'
import { listCategories } from '../api/categories'
import type { Category, Expense } from '../types'
import { ApiError } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { IconButton } from '../components/IconButton'
import { EditIcon, TrashIcon } from '../components/icons'

const currency = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

const emptyForm = { description: '', amount: '', date: '', categoryId: '' }

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState({ categoryId: '', dateFrom: '', dateTo: '' })

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  async function loadExpenses() {
    setLoading(true)
    setError(null)
    try {
      const data = await expensesApi.listExpenses({
        categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      })
      setExpenses(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los gastos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    loadExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  function startEdit(expense: Expense) {
    setEditingId(expense.id)
    setForm({
      description: expense.description,
      amount: String(expense.amount),
      date: expense.date,
      categoryId: String(expense.category.id),
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const payload = {
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        categoryId: Number(form.categoryId),
      }
      if (editingId) {
        await expensesApi.updateExpense(editingId, payload)
      } else {
        await expensesApi.createExpense(payload)
      }
      resetForm()
      await loadExpenses()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el gasto')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await expensesApi.deleteExpense(deleteTarget.id)
      setDeleteTarget(null)
      await loadExpenses()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el gasto')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Gastos</h2>
      </div>

      <div className="form-card">
        <h3>{editingId ? 'Editar gasto' : 'Nuevo gasto'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Descripción
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </label>
            <label>
              Monto
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </label>
            <label>
              Fecha
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>
            <label>
              Categoría
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="" disabled>Selecciona...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>
          {formError && <p className="error-text">{formError}</p>}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar gasto'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="form-card">
        <h3>Filtros</h3>
        <div className="form-row">
          <label>
            Categoría
            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            Desde
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </label>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="table-wrap">
        {loading ? (
          <div className="page-loading">Cargando...</div>
        ) : expenses.length === 0 ? (
          <p className="empty-state">No hay gastos que coincidan con los filtros.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.description}</td>
                  <td>{expense.category.name}</td>
                  <td>{expense.date}</td>
                  <td>{currency.format(expense.amount)}</td>
                  <td className="actions-cell">
                    <IconButton label="Editar" onClick={() => startEdit(expense)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton label="Eliminar" variant="danger" onClick={() => setDeleteTarget(expense)}>
                      <TrashIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={`¿Eliminar el gasto "${deleteTarget.description}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
