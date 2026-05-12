# Sistema de Usuarios y Roles - NestJS + JWT + PostgreSQL

Preparcial: aplicación NestJS con autenticación JWT (Passport), autorización por roles (decoradores y guards personalizados) y persistencia en PostgreSQL con relación muchos-a-muchos entre usuarios y roles.

## Stack

- **NestJS 10** (TypeScript)
- **Passport** + `passport-jwt`
- **bcryptjs** para hash de contraseñas
- **TypeORM** + migraciones SQL
- **PostgreSQL**
- **class-validator** + DTOs

## Estructura

```
src/
├── auth/
│   ├── dto/{register.dto.ts, login.dto.ts}
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── jwt.strategy.ts
├── users/
│   ├── dto/assign-roles.dto.ts
│   ├── user.entity.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── roles/
│   ├── dto/create-role.dto.ts
│   ├── role.entity.ts
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   └── roles.module.ts
├── common/
│   ├── decorators/roles.decorator.ts
│   └── guards/{jwt-auth.guard.ts, roles.guard.ts}
├── database/
│   ├── data-source.ts
│   └── migrations/1715000000000-InitialMigration.ts
├── app.module.ts
└── main.ts
```

## Setup

### 1. Variables de entorno

Copiar `.env.example` a `.env` y ajustar:

```bash
cp .env.example .env
```

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=users_roles_db

JWT_SECRET=mi_super_secreto_jwt_cambiar_en_produccion
JWT_EXPIRES_IN=120s
```

### 2. Crear la base de datos

```bash
createdb users_roles_db
# o desde psql:
# CREATE DATABASE users_roles_db;
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Correr migraciones

```bash
npm run migration:run
```

Crea las tablas `users`, `roles` y `users_roles` (pivote) con las FK necesarias.

### 5. (Opcional) Cargar datos de prueba

```bash
psql -U postgres -d users_roles_db -f seed.sql
```

Crea 3 roles (`admin`, `doctor`, `user`) y 4 usuarios:

| Email               | Password       | Rol     | Activo |
|---------------------|----------------|---------|--------|
| admin@test.com      | `Admin123!`    | admin   | ✅     |
| doctor@test.com     | `Doctor123!`   | doctor  | ✅     |
| user@test.com       | `User123!`     | user    | ✅     |
| inactivo@test.com   | `Inactivo123!` | (sin)   | ❌     |

### 6. Levantar servidor

```bash
npm run start:dev
```

Servidor en `http://localhost:3000`.

## Endpoints

| Método | URI                    | Acceso        | Descripción                           |
|--------|------------------------|---------------|---------------------------------------|
| POST   | `/auth/register`       | público       | Registrar usuario (roles opcionales)  |
| POST   | `/auth/login`          | público       | Login, retorna `access_token`         |
| POST   | `/roles`               | admin         | Crear rol                             |
| GET    | `/roles`               | admin         | Listar roles                          |
| PATCH  | `/users/:id/roles`     | admin         | Asignar roles a un usuario            |
| GET    | `/users/me`            | autenticado   | Perfil propio                         |
| GET    | `/users`               | admin         | Listar usuarios                       |

### Autenticación

Todos los endpoints protegidos esperan:

```
Authorization: Bearer <access_token>
```

El JWT expira en 120s por defecto (`JWT_EXPIRES_IN`).

## Probar con cURL

### Login como admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
# => { "access_token": "eyJhbGc..." }
```

Guarda el token:

```bash
TOKEN="eyJhbGc..."
```

### Crear rol (admin)

```bash
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role_name":"nurse","description":"Enfermería"}'
```

### Listar roles

```bash
curl http://localhost:3000/roles -H "Authorization: Bearer $TOKEN"
```

### Asignar roles a un usuario

```bash
curl -X PATCH http://localhost:3000/users/cccccccc-cccc-cccc-cccc-cccccccccccc/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roles":["doctor","nurse"]}'
```

### Registrar usuario (con rol opcional)

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"nuevo@test.com",
    "password":"NuevoPass123!",
    "name":"Nuevo Usuario",
    "roles":["user"]
  }'
```

### Perfil propio

```bash
curl http://localhost:3000/users/me -H "Authorization: Bearer $TOKEN"
```

### Listar usuarios (admin)

```bash
curl http://localhost:3000/users -H "Authorization: Bearer $TOKEN"
```

### Probar usuario desactivado (423 Locked)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"inactivo@test.com","password":"Inactivo123!"}'
# => 423 Locked: "Usuario desactivado"
```

## Códigos de respuesta

Cada endpoint respeta los códigos del enunciado:

- **201** Created: registro / creación de rol
- **200** OK: login / consultas / asignación
- **400** Bad Request: validación fallida (`role_name es requerido`, `roles inválidos`)
- **401** Unauthorized: credenciales incorrectas o token faltante/inválido
- **403** Forbidden: no autorizado (rol insuficiente)
- **404** Not Found: usuario no encontrado
- **409** Conflict: `Email ya registrado`, `role_name ya existe`
- **423** Locked: usuario desactivado en login
- **500** Internal Server Error: error inesperado

## Decorador y Guard de Roles

El decorador `@Roles('admin', 'doctor')` guarda metadata en el handler; `RolesGuard` la lee con `Reflector`, compara contra los roles del payload del JWT y retorna 403 si no coincide.

```ts
@Post()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
create(@Body() dto: CreateRoleDto) { ... }
```

## Seguridad

- Passwords hasheadas con `bcryptjs` (10 rounds).
- El campo `password` **nunca** se retorna en las respuestas.
- Todas las entradas se validan con DTOs (`class-validator`).
- JWT con expiración corta (120s por defecto).
- `JWT_SECRET` por variable de entorno.

## Comandos útiles

```bash
npm run start:dev        # desarrollo con watch
npm run build            # compilar a dist/
npm run start:prod       # producción
npm run migration:run    # ejecutar migraciones
npm run migration:revert # revertir última migración
```

## Entregables

1. ✅ Migraciones SQL de la BD (`src/database/migrations/`)
2. ✅ Script SQL de usuarios y roles probados (`seed.sql`)
3. 📦 Release del repositorio en Github
