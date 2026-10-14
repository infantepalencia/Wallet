import { useEffect, useState, type FormEvent } from 'react'
import * as rolesApi from '../api/roles'
import type { Role } from '../types'
import { ApiError } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { IconButton } from '../components/IconButton'
import { EditIcon, TrashIcon } from '../components/icons'

const emptyForm = { name: '', description: '' }

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setRoles(await rolesApi.listRoles())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(role: Role) {
    setEditingId(role.id)
    setForm({ name: role.name, description: role.description ?? '' })
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
      const payload = { name: form.name, description: form.description || null }
      if (editingId) {
        await rolesApi.updateRole(editingId, payload)
      } else {
        await rolesApi.createRole(payload)
      }
      resetForm()
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el rol')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await rolesApi.deleteRole(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el rol')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Roles</h2>
      </div>

      <div className="form-card">
        <h3>{editingId ? 'Editar rol' : 'Nuevo rol'}</h3>
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
          </div>
          {formError && <p className="error-text">{formError}</p>}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar rol'}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="table-wrap">
        {loading ? (
          <div className="page-loading">Cargando...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.description}</td>
                  <td className="actions-cell">
                    <IconButton label="Editar" onClick={() => startEdit(role)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton label="Eliminar" variant="danger" onClick={() => setDeleteTarget(role)}>
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
          message={`¿Eliminar el rol "${deleteTarget.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
