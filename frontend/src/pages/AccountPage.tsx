import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme, type ThemePreference } from '../context/ThemeContext'
import * as usersApi from '../api/users'
import { ApiError } from '../api/client'

type Tab = 'perfil' | 'seguridad' | 'preferencias'

const TABS: { id: Tab; label: string }[] = [
  { id: 'perfil', label: 'Datos personales' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'preferencias', label: 'Preferencias' },
]

export function AccountPage() {
  const [tab, setTab] = useState<Tab>('perfil')

  return (
    <div>
      <div className="page-header">
        <h2>Mi cuenta</h2>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'perfil' && <ProfileTab />}
      {tab === 'seguridad' && <SecurityTab />}
      {tab === 'preferencias' && <PreferencesTab />}
    </div>
  )
}

function ProfileTab() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!user) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setSaving(true)
    try {
      await usersApi.updateProfile({ name, email, phone })
      await refreshUser()
      setMessage('Perfil actualizado correctamente')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="form-card">
      <h3>Datos personales</h3>
      <p className="muted-text">Actualiza tu nombre, correo y celular de contacto.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Correo electrónico
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Número de celular
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="300 123 4567" />
          </label>
        </div>
        {error && <p className="error-text">{error}</p>}
        {message && <p className="success-text">{message}</p>}
        <div style={{ marginTop: 12 }}>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setSaving(true)
    try {
      await usersApi.changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Contraseña actualizada correctamente')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="form-card">
        <h3>Cambiar contraseña</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Contraseña actual
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label>
              Nueva contraseña
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
          </div>
          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}
          <div style={{ marginTop: 12 }}>
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      </div>

      <div className="form-card">
        <h3>Política de seguridad</h3>
        <ul className="policy-list">
          <li>Tu contraseña se almacena cifrada con BCrypt; nadie en Wallet puede verla en texto plano.</li>
          <li>Usa al menos 8 caracteres, combinando letras, números y símbolos.</li>
          <li>Tu sesión se identifica con un token JWT que expira automáticamente; después de ese tiempo deberás iniciar sesión de nuevo.</li>
          <li>No compartas tu contraseña ni tu sesión iniciada en dispositivos compartidos.</li>
          <li>Si sospechas de un acceso no autorizado, cambia tu contraseña de inmediato desde esta sección.</li>
        </ul>
      </div>
    </>
  )
}

function PreferencesTab() {
  const { preference, setPreference } = useTheme()

  const options: { id: ThemePreference; label: string; description: string }[] = [
    { id: 'light', label: 'Claro', description: 'Fondo claro en todo momento' },
    { id: 'dark', label: 'Oscuro', description: 'Fondo oscuro en todo momento' },
    { id: 'system', label: 'Sistema', description: 'Sigue la preferencia de tu dispositivo' },
  ]

  return (
    <div className="form-card">
      <h3>Apariencia</h3>
      <p className="muted-text">Elige cómo quieres que se vea Wallet en este dispositivo.</p>
      <div className="theme-options">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`theme-option ${preference === option.id ? 'active' : ''}`}
            onClick={() => setPreference(option.id)}
          >
            <span className={`theme-swatch swatch-${option.id}`} aria-hidden="true" />
            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
