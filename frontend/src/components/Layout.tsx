import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LogoMark } from './Logo'

export function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSidebarOpen(false)
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <LogoMark />
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/expenses">Gastos</NavLink>
          <NavLink to="/categories">Categorías</NavLink>
          {isAdmin && (
            <>
              <div className="nav-section">Administración</div>
              <NavLink to="/admin/users">Usuarios</NavLink>
              <NavLink to="/admin/roles">Roles</NavLink>
            </>
          )}
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="menu-toggle"
            aria-label="Abrir menú"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="topbar-spacer" />

          <div className="account-menu" ref={menuRef}>
            <button type="button" className="account-trigger" onClick={() => setMenuOpen((v) => !v)}>
              <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
              <span className="account-trigger-text">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role.name}</span>
              </span>
            </button>

            {menuOpen && <AccountDropdown onClose={() => setMenuOpen(false)} onLogout={logout} />}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AccountDropdown({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const { preference, setPreference } = useTheme()

  return (
    <div className="account-dropdown">
      <NavLink to="/account" className="dropdown-item" onClick={onClose}>
        Mi cuenta
      </NavLink>

      <div className="dropdown-section-label">Apariencia</div>
      <div className="theme-mini-switch">
        <button
          type="button"
          className={preference === 'light' ? 'active' : ''}
          onClick={() => setPreference('light')}
        >
          Claro
        </button>
        <button
          type="button"
          className={preference === 'dark' ? 'active' : ''}
          onClick={() => setPreference('dark')}
        >
          Oscuro
        </button>
        <button
          type="button"
          className={preference === 'system' ? 'active' : ''}
          onClick={() => setPreference('system')}
        >
          Sistema
        </button>
      </div>

      <button type="button" className="dropdown-item dropdown-danger" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  )
}
