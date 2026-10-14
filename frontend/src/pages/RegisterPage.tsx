import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'
import { LogoIcon } from '../components/Logo'

const PASSWORD_CHECKS = [
  { id: 'length', label: 'Al menos 8 caracteres', test: (v: string) => v.length >= 8 },
  { id: 'letterNumber', label: 'Combina letras y números', test: (v: string) => /[a-zA-Z]/.test(v) && /[0-9]/.test(v) },
  { id: 'case', label: 'Usa mayúsculas y minúsculas', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'symbol', label: 'Incluye un símbolo (opcional pero recomendado)', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
]

export function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ email, name, phone: phone.trim() || undefined, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <LogoIcon size={56} />
        <h1>Crear cuenta</h1>
        <p>Regístrate para empezar a controlar tus gastos</p>
        <form onSubmit={handleSubmit}>
          <label>
            Nombre completo
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Correo electrónico
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Número de celular <span className="optional-hint">(opcional)</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="300 123 4567"
              autoComplete="tel"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              minLength={8}
              required
            />
          </label>

          {(passwordFocused || password.length > 0) && (
            <ul className="password-checklist">
              {PASSWORD_CHECKS.map((check) => {
                const passed = check.test(password)
                return (
                  <li key={check.id} className={passed ? 'check-ok' : 'check-pending'}>
                    <span className="check-icon">{passed ? '✓' : '○'}</span>
                    {check.label}
                  </li>
                )
              })}
            </ul>
          )}

          {error && <span className="error-text">{error}</span>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <div className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  )
}
