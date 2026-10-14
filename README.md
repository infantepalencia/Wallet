# Wallet — Control de gastos personales

Aplicación web Full Stack para gestión de gastos personales. Los usuarios registran gastos, los clasifican por categoría, consultan reportes y administran su perfil. Incluye dos roles: **USER** (gestiona sus propios gastos) y **ADMIN** (además administra usuarios, roles y categorías).

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, TypeScript, React Router, Vite, CSS propio con temas claro/oscuro |
| Backend | Kotlin, Spring Boot, Spring Security, API REST |
| Base de datos | MySQL (JPA/Hibernate) |
| Autenticación | JWT (estado sin sesión) |

## Requisitos previos

- **JDK 17+** (Gradle puede descargar el toolchain automáticamente)
- **Node.js 20+**
- **MySQL 8+** ejecutándose en `localhost:3306`
- Windows: usar `gradlew.bat` en lugar de `./gradlew` (o Git Bash / WSL)

## Configuración

### 1. Base de datos

```sql
CREATE DATABASE wallet;
CREATE USER 'wallet_app'@'localhost' IDENTIFIED BY 'wallet_pass';
GRANT ALL PRIVILEGES ON wallet.* TO 'wallet_app'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Variables de entorno (opcionales)

El backend lee estas variables (`backend/src/main/resources/application.yml`); los valores por defecto funcionan si creaste la BD y el usuario con los datos de arriba, excepto la contraseña:

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/wallet` | URL de conexión |
| `DB_USERNAME` | `wallet_app` | Usuario MySQL |
| `DB_PASSWORD` | `changeme` | Contraseña MySQL |
| `JWT_SECRET` | valor de desarrollo | Secreto para firmar tokens (cámbialo) |
| `JWT_EXPIRATION_MINUTES` | `30` | Duración del token |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Origen permitido del frontend |

Ejemplo en PowerShell (ajusta la contraseña a la que creaste en MySQL):

```powershell
$env:DB_PASSWORD = "wallet_pass"
$env:JWT_SECRET  = "un-secreto-largo-y-seguro-de-al-menos-32-caracteres"
```

## Ejecución

### Backend (puerto 8080)

```bash
cd backend
./gradlew bootRun        # Windows: gradlew.bat bootRun
```

Verifica que levantó: `curl http://localhost:8080` → `{"message":"Wallet API"}`

### Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. Si el backend está en otra URL, define `VITE_API_URL` en `frontend/.env`:

```
VITE_API_URL=http://localhost:8080
```

## Datos de prueba (semilla automática)

Al arrancar el backend se crean si no existen:

- **Admin:** `admin@wallet.com` / `Admin1234` (rol ADMIN)
- **Roles:** `ADMIN`, `USER`
- **Categorías:** Alimentación, Transporte, Salud, Educación, Vivienda, Entretenimiento, Servicios, Otros

## Verificación del proyecto

```bash
# Frontend: lint y build (incluye chequeo de tipos con tsc)
cd frontend && npm run lint && npm run build

# Backend: compilación y tests (aún no hay tests; se pueden añadir en src/test)
cd backend && ./gradlew build
```

## Probar la API

**Login** (guarda el token de la respuesta):

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wallet.com","password":"Admin1234"}'
```

En Windows PowerShell:

```powershell
curl.exe -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d '{\"email\":\"admin@wallet.com\",\"password\":\"Admin1234\"}'
```

**Crear gasto** (con el token obtenido):

```bash
curl -X POST http://localhost:8080/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"description":"Almuerzo","amount":12500,"date":"2026-10-13","categoryId":1}'
```

**Consultar gastos y reportes:**

```bash
curl http://localhost:8080/expenses -H "Authorization: Bearer <TOKEN>"
curl "http://localhost:8080/expenses?categoryId=1&dateFrom=2026-10-01&dateTo=2026-10-31" -H "Authorization: Bearer <TOKEN>"
curl http://localhost:8080/reports/total -H "Authorization: Bearer <TOKEN>"
```

**Probar desde la UI:** inicia sesión como `admin@wallet.com`, crea gastos en *Gastos*, revisa el *Dashboard* (métricas y gráfica por categoría) y explora *Administración* (usuarios y roles). Un usuario registrado normal solo ve sus propios gastos.

## Endpoints principales

| Método | Ruta | Descripción | Requiere |
| --- | --- | --- | --- |
| GET | `/` | Salud de la API | — |
| POST | `/auth/register` | Registrar usuario | — |
| POST | `/auth/login` | Login, devuelve JWT | — |
| GET/POST | `/expenses` | Listar (con filtros) / crear gasto | USER |
| GET/PUT/DELETE | `/expenses/{id}` | Ver / editar / eliminar gasto | USER |
| GET | `/expenses/all` | Todos los gastos (con filtros) | ADMIN |
| GET/POST | `/categories` | Listar / crear categoría | USER |
| GET/PUT/DELETE | `/categories/{id}` | Ver / editar / eliminar categoría | USER |
| GET/PUT | `/users/me` | Perfil del usuario autenticado | USER |
| POST | `/users/me/change-password` | Cambiar contraseña | USER |
| GET/POST | `/users` | Listar / crear usuarios | ADMIN |
| PUT/DELETE | `/users/{id}` | Editar / eliminar usuario | ADMIN |
| PUT | `/users/{id}/role` | Cambiar rol de usuario | ADMIN |
| PUT | `/users/{id}/status` | Activar / desactivar usuario | ADMIN |
| CRUD | `/roles[/{id}]` | Gestión de roles | ADMIN |
| GET | `/reports/total` | Total gastado | USER |
| GET | `/reports/by-category` | Gastos agrupados por categoría | USER |
| GET | `/reports/by-period` | Gastos agrupados por mes/año | USER |
| GET | `/reports/summary` | Resumen del dashboard | USER |

Los filtros de `/expenses` admiten: `categoryId`, `date`, `dateFrom`, `dateTo`, `minAmount`, `maxAmount`.

## Estructura del proyecto

```
wallet/
├── backend/                  # API Kotlin + Spring Boot
│   └── src/main/kotlin/co/edu/iub/wallet/
│       ├── controller/       # Endpoints REST
│       ├── service/          # Lógica de negocio
│       ├── repository/       # Acceso a datos (JPA)
│       ├── model/            # Entidades
│       ├── dto/              # Request/Response
│       ├── config/           # Seguridad, JWT, semilla de datos
│       └── exception/        # Manejo global de errores
└── frontend/                 # React 19 + TypeScript + Vite
    └── src/
        ├── api/              # Cliente HTTP y endpoints
        ├── pages/            # Pantallas (Dashboard, Gastos, Categorías, Perfil, Admin)
        ├── components/       # Layout, tablas, modales, iconos
        ├── context/          # Auth y tema (claro/oscuro)
        └── types/            # Tipos TypeScript
```
