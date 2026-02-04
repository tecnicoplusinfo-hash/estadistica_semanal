# ESTADISTICA SEMANAL

Aplicación web para gestión de estadísticas semanales con roles de usuario (ADMIN/TRABAJADOR).

## Características

- **Autenticación JWT** con roles de usuario
- **Gestión de estadísticas** semanales (Servicios, Reseñas, Páginas, Tarjetas, Llaves)
- **Gestión de locales** (solo ADMIN)
- **Gestión de usuarios** (solo ADMIN)
- **Cálculo automático de semanas** (Viernes 15:00 a Viernes 15:00)
- **Diseño responsive** para móvil
- **Filtros** por semana, usuario, local y tipo
- **Dashboard** con resúmenes agregados

## Tecnologías

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Frontend**: React + Vite
- **Despliegue**: Railway

## Instalación Local

### Requisitos previos
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Cargar datos de prueba
npx prisma db seed

# Iniciar servidor
npm run dev
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar API URL
cp .env.example .env
# Editar VITE_API_URL si es necesario

# Iniciar desarrollo
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Despliegue en Railway

1. **Fork este repositorio** o conectar tu propio repo

2. **Crear nuevo proyecto en Railway**
   - Ve a [railway.app](https://railway.app)
   - Click en "New Project" → "Deploy from GitHub repo"

3. **Configurar variables de entorno**
   En tu proyecto de Railway, añade estas variables:

   ```
   DATABASE_URL=(se crea automáticamente con el plugin de PostgreSQL)
   JWT_SECRET=genera-una-clave-segura-de-32-caracteres-o-mas
   PORT=3000
   NODE_ENV=production
   ```

4. **Añadir plugin de PostgreSQL**
   - En tu proyecto, click en "New Plugin"
   - Selecciona "PostgreSQL"
   - Railway creará automáticamente `DATABASE_URL`

5. **Deploy**
   - Railway detectará automáticamente el proyecto
   - Espera a que finalice el build
   - Ejecuta el seed para crear el admin inicial:
     ```
     npx prisma db seed
     ```

## Usuario por Defecto

Después del despliegue inicial, se crea un usuario admin:

- **Email**: `admin@estadistica.local`
- **Contraseña**: `admin123`
- **Rol**: ADMIN

⚠️ **IMPORTANTE**: Cambia estas credenciales después del primer login.

## Locales por Defecto

La aplicación incluye estos locales preconfigurados:
- Mataro Plus
- Aseguritanca
- Cerrajeroplus
- El Promanya
- Mikey
- FortiPany
- Cornepany
- Balesseps
- ObriTop
- CerraSaba

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro (solo primer admin)
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil del usuario actual

### Usuarios (ADMIN)
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Editar usuario
- `PUT /api/users/:id/password` - Cambiar contraseña
- `PATCH /api/users/:id/deactivate` - Desactivar usuario
- `PATCH /api/users/:id/activate` - Activar usuario
- `GET /api/users/:id/statistics` - Estadísticas de un usuario

### Locales (ADMIN)
- `GET /api/locals` - Listar locales activos
- `GET /api/locals/all` - Listar todos los locales
- `POST /api/locals` - Crear local
- `PUT /api/locals/:id` - Editar local
- `DELETE /api/locals/:id` - Eliminar local

### Estadísticas
- `GET /api/statistics` - Listar con filtros
- `GET /api/statistics/summary` - Resumen agregado
- `GET /api/statistics/weeks` - Lista de semanas
- `POST /api/statistics` - Crear estadística
- `PUT /api/statistics/:id` - Editar estadística
- `DELETE /api/statistics/:id` - Eliminar estadística

## Licencia

MIT
