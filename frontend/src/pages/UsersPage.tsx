import { useEffect, useMemo, useState, type FormEvent } from 'react'
import * as usersApi from '../api/users'
import { listRoles } from '../api/roles'
import type { Role, User } from '../types'
import { ApiError } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { IconButton } from '../components/IconButton'
import { EditIcon, PlusIcon, PowerIcon, TrashIcon } from '../components/icons'
import { useAuth } from '../context/AuthContext'

const emptyForm = { name: '', email: '', phone: '', password: '', roleId: '' }

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const [tab, setTab] = useState<'ADMIN' | 'USER'>('ADMIN')
  const [search, setSearch] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [usersData, rolesData] = await Promise.all([usersApi.listUsers(), listRoles()])
      setUsers(usersData)
      setRoles(rolesData)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const tabUsers = useMemo(() => users.filter((u) => u.role.name === tab), [users, tab])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return tabUsers
    return tabUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone ?? '').toLowerCase().includes(term),
    )
  }, [tabUsers, search])

  const adminCount = useMemo(() => users.filter((u) => u.role.name === 'ADMIN').length, [users])
  const userCount = useMemo(() => users.filter((u) => u.role.name === 'USER').length, [users])

  function startCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, roleId: roles.find((r) => r.name === tab)?.id.toString() ?? '' })
    setFormError(null)
    setFormOpen(true)
  }

  function startEdit(user: User) {
    setEditingId(user.id)
    setForm({ name: user.name, email: user.email, phone: user.phone ?? '', password: '', roleId: '' })
    setFormError(null)
    setFormOpen(true)
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError(null)
    setFormOpen(false)
  }

  async function handleRoleChange(userId: number, roleId: number) {
    setBusyId(userId)
    try {
      await usersApi.updateUserRole(userId, roleId)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el rol')
    } finally {
      setBusyId(null)
    }
  }

  async function handleStatusToggle(user: User) {
    setBusyId(user.id)
    try {
      await usersApi.updateUserStatus(user.id, !user.active)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado')
    } finally {
      setBusyId(null)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      if (editingId) {
        await usersApi.adminUpdateUser(editingId, {
          name: form.name,
          email: form.email,
          phone: form.phone,
        })
      } else {
        await usersApi.createUser({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          roleId: Number(form.roleId),
        })
      }
      resetForm()
      await load()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el usuario')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await usersApi.deleteUser(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el usuario')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Usuarios</h2>
        {!formOpen && (
          <button className="btn-primary btn-icon-text" onClick={startCreate}>
            <PlusIcon size={16} /> Nuevo
          </button>
        )}
      </div>

      {formOpen && (
        <div className="form-card">
          <h3>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Nombre
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label>
                Correo electrónico
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </label>
              <label>
                Número de celular
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="300 123 4567"
                />
              </label>
              {!editingId && (
                <>
                  <label>
                    Contraseña
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      minLength={8}
                      required
                    />
                  </label>
                  <label>
                    Rol
                    <select
                      value={form.roleId}
                      onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                      required
                    >
                      <option value="" disabled>Selecciona...</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>
            {editingId && (
              <p className="muted-text" style={{ marginTop: 8 }}>
                Para cambiar el rol o el estado, usa los controles de la tabla. La contraseña solo la puede cambiar
                el propio usuario desde "Mi cuenta".
              </p>
            )}
            {formError && <p className="error-text">{formError}</p>}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear usuario'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tabs">
        <button
          type="button"
          className={`tab-btn ${tab === 'ADMIN' ? 'active' : ''}`}
          onClick={() => setTab('ADMIN')}
        >
          Administradores ({adminCount})
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === 'USER' ? 'active' : ''}`}
          onClick={() => setTab('USER')}
        >
          Usuarios ({userCount})
        </button>
      </div>

      <div className="form-card" style={{ marginBottom: 12 }}>
        <label>
          Buscar en {tab === 'ADMIN' ? 'administradores' : 'usuarios'}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, correo o celular..."
          />
        </label>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="table-wrap">
        {loading ? (
          <div className="page-loading">Cargando...</div>
        ) : filteredUsers.length === 0 ? (
          <p className="empty-state">
            {search
              ? 'No hay usuarios que coincidan con la búsqueda.'
              : `No hay ${tab === 'ADMIN' ? 'administradores' : 'usuarios'} registrados.`}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Celular</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone ?? '—'}</td>
                  <td>
                    <select
                      value={user.role.id}
                      disabled={busyId === user.id}
                      onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`badge ${user.active ? 'badge-success' : 'badge-muted'}`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <IconButton
                      label={user.active ? 'Desactivar' : 'Activar'}
                      disabled={busyId === user.id}
                      onClick={() => handleStatusToggle(user)}
                    >
                      <PowerIcon />
                    </IconButton>
                    <IconButton label="Editar" onClick={() => startEdit(user)}>
                      <EditIcon />
                    </IconButton>
                    {user.id !== currentUser?.id && (
                      <IconButton label="Eliminar" variant="danger" onClick={() => setDeleteTarget(user)}>
                        <TrashIcon />
                      </IconButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message={`¿Eliminar al usuario "${deleteTarget.name}"? Si tiene gastos registrados no podrá eliminarse; desactívalo en su lugar.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
