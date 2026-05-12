# preparcial - usuarios y roles

nestjs con jwt y postgres

## setup

necesita postgres. crear la base:

```
createdb users_roles_db
```

copiar .env.example a .env y poner las credenciales de la base, despues:

```
npm install
npm run migration:run
psql -U postgres -d users_roles_db -f seed.sql
npm run start:dev
```

corre en localhost:3000

## usuarios de prueba

- admin@test.com / Admin123!
- doctor@test.com / Doctor123!
- user@test.com / User123!
- inactivo@test.com / Inactivo123! → este esta desactivado para probar el 423

## endpoints

- POST /auth/register
- POST /auth/login
- POST /roles (admin)
- GET /roles (admin)
- PATCH /users/:id/roles (admin) - body: `{ roles: ["admin","doctor"] }`
- GET /users/me
- GET /users (admin)

el token va en `Authorization: Bearer <token>` y dura 120s

## notas

- el RolesGuard agarra los roles del payload del jwt y los compara con los del decorador
- las passwords se guardan con bcrypt
- si al asignar roles devuelve 400, es porque alguno de los nombres no existe en la tabla roles
