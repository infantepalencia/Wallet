import { useEffect, useMemo, useState, type FormEvent } from 'react'
import * as categoriesApi from '../api/categories'
import type { Category } from '../types'
import { ApiError } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { IconButton } from '../components/IconButton'
import { EditIcon, TrashIcon } from '../components/icons'

const emptyForm = { name: '', description: '', active: true }

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setCategories(await categoriesApi.listCategories())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return categories
    return categories.filter(
      (c) => c.name.toLowerCase().includes(term) || (c.description ?? '').toLowerCase().includes(term),
    )
  }, [categories, search])

  function startEdit(category: Category) {
    setEditingId(category.id)
    setForm({ name: category.name, description: category.description ?? '', active: category.active })
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
      const payload = { name: form.name, description: form.description || null, active: form.active }
      if (editingId) {
        await categoriesApi.updateCategory(editingId, payload)
      } else {
        await categoriesApi.createCategory(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la categoría')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await categoriesApi.deleteCategory(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la categoría')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Categorías</h2>
      </div>

      <div className="form-card">
        <h3>{editingId ? 'Editar categoría' : 'Nueva categoría'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Nombre
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Descripción
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label>
              Activa
              <select
                value={form.active ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </label>
          </div>
          {formError && <p className="error-text">{formError}</p>}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar categoría'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="form-card" style={{ marginBottom: 12 }}>
        <label>
          Buscar
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre o descripción..."
          />
        </label>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="table-wrap">
        {loading ? (
          <div className="page-loading">Cargando...</div>
        ) : filteredCategories.length === 0 ? (
          <p className="empty-state">No hay categorías que coincidan con la búsqueda.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>
                    <span className={`badge ${category.active ? 'badge-success' : 'badge-muted'}`}>
                      {category.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <IconButton label="Editar" onClick={() => startEdit(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton label="Eliminar" variant="danger" onClick={() => setDeleteTarget(category)}>
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
          message={`¿Eliminar la categoría "${deleteTarget.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
