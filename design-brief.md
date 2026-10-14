# Brief de diseño — Wallet (app de control de gastos personales)

## Prompt para pegar directamente

> Necesito que rediseñes la interfaz de **Wallet**, una app web de control de gastos personales construida en **React 19 + TypeScript + Vite**, actualmente con CSS propio (sin librería de componentes) y variables CSS para tema claro/oscuro. El diseño funcional ya existe y funciona correctamente; lo que necesito es una propuesta visual más pulida y profesional (estética fintech: limpia, confiable, moderna, con buen uso de espacio en blanco y jerarquía tipográfica), manteniendo la misma estructura de pantallas y flujos que detallo abajo. Necesito: paleta de colores (con variantes light/dark), tipografía, sistema de espaciado, estilos de componentes (botones, inputs, tablas, tarjetas, badges, gráficas), y mockups o especificaciones de cada pantalla listada. Todo debe ser implementable con CSS/HTML plano o CSS-in-JS simple, sin dependencias pesadas de UI.

---

## 1. Contexto del proyecto

**Wallet** es una aplicación web para gestión de gastos personales: los usuarios registran gastos, los clasifican por categoría, consultan reportes y administran su perfil. Tiene dos roles: **USER** (gestiona sus propios gastos) y **ADMIN** (además administra usuarios, roles y categorías).

- **Stack actual:** React 19, TypeScript, React Router, Vite. CSS propio con variables (`--bg`, `--surface`, `--text`, `--accent`, `--border`, etc.), soporte de tema claro/oscuro vía `prefers-color-scheme`.
- **Backend:** API REST en Kotlin/Spring Boot (JWT), ya funcional — el rediseño es solo de la capa visual del frontend, no cambia contratos de API ni flujos.
- **Público objetivo:** estudiantes/usuarios individuales que quieren un control simple y claro de sus finanzas personales. Debe transmitir **confianza y orden**, no ser "juguetón".

## 2. Estado visual actual (a mejorar)

- Layout: sidebar fija a la izquierda + topbar arriba + contenido centrado (max 1100px).
- Componentes genéricos: tarjetas blancas con borde sutil, tablas simples, botones planos morado/violeta como color de acento.
- Gráficas: barras horizontales hechas con `<div>` y CSS, sin animaciones ni mayor personalidad visual.
- Sin iconografía, sin ilustraciones, sin estados vacíos diseñados, sin microinteracciones.

## 3. Pantallas a diseñar

### 3.1 Autenticación
- **Login** — formulario centrado (correo, contraseña), enlace a registro, manejo de error visible.
- **Registro** — formulario centrado (nombre, correo, contraseña con hint de mínimo 8 caracteres), enlace a login.

### 3.2 Dashboard (dueño: cualquier usuario autenticado)
- 4 tarjetas de estadísticas: total gastado, cantidad de gastos, categorías con gastos, periodos con gastos.
- Gráfica de gastos por categoría (actualmente barras horizontales — se puede proponer donut/barra vertical/lo que se vea mejor).
- Tabla de gastos por periodo (mes/año, cantidad, total).
- Estado vacío cuando no hay gastos registrados aún.

### 3.3 Gastos (`/expenses`)
- Formulario de alta/edición: descripción, monto, fecha, categoría (select).
- Panel de filtros: categoría, rango de fechas (desde/hasta).
- Tabla de gastos: descripción, categoría, fecha, monto, acciones (editar/eliminar).
- Confirmación de eliminación (modal).

### 3.4 Categorías (`/categories`)
- Lista de categorías (nombre, descripción, estado activo/inactivo) con badge de estado.
- Formulario CRUD (solo visible para ADMIN).
- Ejemplos reales de categorías: Alimentación, Transporte, Salud, Educación, Vivienda, Entretenimiento, Servicios, Otros.

### 3.5 Mi perfil (`/profile`)
- Formulario de datos personales (nombre, correo).
- Formulario separado de cambio de contraseña (actual + nueva).

### 3.6 Administración — Usuarios (`/admin/users`, solo ADMIN)
- Tabla: nombre, correo, rol (selector inline), estado (badge + botón activar/desactivar).

### 3.7 Administración — Roles (`/admin/roles`, solo ADMIN)
- CRUD de roles (nombre, descripción) con tabla + formulario.

## 4. Navegación y layout global

- **Sidebar** con: Dashboard, Gastos, Categorías, Mi perfil, y sección "Administración" (Usuarios, Roles) visible solo para ADMIN.
- **Topbar**: nombre del usuario, badge de su rol, botón de cerrar sesión.
- Layout responsive deseable (uso principal en desktop, pero no debería romperse en tablet/mobile).

## 5. Qué entregar

1. Paleta de colores completa (light + dark) como variables CSS, incluyendo estados (éxito, error, advertencia).
2. Tipografía (familia, escala de tamaños, pesos).
3. Sistema de espaciado/grid.
4. Especificación de componentes: botón primario/secundario/peligro, input, select, badge, tarjeta, tabla, modal, nav link (activo/inactivo).
5. Mockup o descripción detallada de cada pantalla listada en la sección 3.
6. Propuesta de iconografía (set sugerido, uso).
7. Estados vacíos y de carga con mejor tratamiento visual que el actual ("Cargando...").

## 6. Restricciones

- No usar librerías pesadas de componentes (Material UI, Ant Design, etc.) — el equipo prefiere CSS propio o una librería muy ligera.
- Debe funcionar en modo claro y oscuro.
- Es un proyecto académico (asignatura de Desarrollo de Software), por lo que el diseño debe ser implementable en tiempo razonable por dos estudiantes, sin infraestructura de diseño compleja (no Figma tokens avanzados, no animaciones costosas de mantener).
