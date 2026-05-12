-- ============================================================
-- SCRIPT DE SEED: usuarios y roles probados
-- ============================================================
-- Pre-requisito: las migraciones deben haberse ejecutado.
--   npm run migration:run
--
-- Las contraseñas están hasheadas con bcryptjs (10 rounds).
-- Credenciales de prueba (texto plano):
--   admin@test.com     / Admin123!
--   doctor@test.com    / Doctor123!
--   user@test.com      / User123!
--   inactivo@test.com  / Inactivo123!  (is_active = false, prueba 423 Locked)
-- ============================================================

BEGIN;

-- Limpiar datos previos (opcional, comentar si no se desea reiniciar)
DELETE FROM users_roles;
DELETE FROM users;
DELETE FROM roles;

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, role_name, description, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin',  'Administrador del sistema con permisos totales', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'doctor', 'Profesional médico con permisos clínicos',       NOW()),
  ('33333333-3333-3333-3333-333333333333', 'user',   'Usuario regular con permisos básicos',           NOW());

-- ============================================================
-- USUARIOS (hashes bcrypt reales, probados)
-- ============================================================
INSERT INTO users (id, email, password, name, phone, is_active, created_at) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'admin@test.com',
   '$2b$10$boOEcCoyKflv.PLwwVPkLeHfkCOdprxZJ6TaZ8r/QONY8RQuJy8Hm',
   'Admin Principal', '3001112233', true, NOW()),

  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'doctor@test.com',
   '$2b$10$kyis/FSNoCMbJhKfnJ.q..Z.4MVQkWv2HxocPHSDdRVNdLy.GuJXi',
   'Dra. Ana Pérez', '3002223344', true, NOW()),

  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   'user@test.com',
   '$2b$10$a5N6YvMCl1O0Gwo.sWrYoeEQcmktpAeRlPzPJC1xS3eTV5hlNUjZy',
   'Usuario Regular', '3003334455', true, NOW()),

  ('dddddddd-dddd-dddd-dddd-dddddddddddd',
   'inactivo@test.com',
   '$2b$10$h8QUD8GpTFZspMdGg6HnwuV4TGCu1cgaM30ifx6bANdCazBgZT/Ty',
   'Usuario Inactivo', NULL, false, NOW());

-- ============================================================
-- ASIGNACIONES users_roles (many-to-many)
-- ============================================================
INSERT INTO users_roles (user_id, role_id) VALUES
  -- admin@test.com  -> admin
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111'),
  -- doctor@test.com -> doctor
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222'),
  -- user@test.com   -> user
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333');
  -- inactivo@test.com sin roles

COMMIT;

-- ============================================================
-- Verificación rápida
-- ============================================================
-- SELECT u.email, u.is_active, COALESCE(r.role_name, '(sin rol)') AS rol
-- FROM users u
-- LEFT JOIN users_roles ur ON ur.user_id = u.id
-- LEFT JOIN roles r ON r.id = ur.role_id
-- ORDER BY u.email;
