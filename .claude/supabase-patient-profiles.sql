-- Ejecutar en Supabase → SQL Editor

-- 1. Tabla que mapea usuario Auth → slug del paciente
CREATE TABLE IF NOT EXISTS patient_profiles (
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  slug     TEXT NOT NULL UNIQUE,
  nombre   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seguridad: cada paciente solo puede ver su propio perfil
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paciente_solo_su_perfil"
  ON patient_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- INSTRUCCIONES PARA AGREGAR CADA PACIENTE:
--
-- PASO 1: Crear usuario en Supabase → Authentication → Users → Add user
--   Email: el email real del paciente (o uno que tú definas)
--   Password: una contraseña inicial (el paciente puede cambiarla luego)
--   ⚠️ Marcar "Auto Confirm User" para que no tenga que confirmar email
--
-- PASO 2: Copiar el UUID del usuario recién creado y ejecutar:

-- INSERT INTO patient_profiles (user_id, slug, nombre) VALUES
--   ('UUID-DEL-USUARIO', 'ioanis-patsias', 'Ioanis Patsias'),
--   ('UUID-DEL-USUARIO', 'diego-lopez',    'Diego López');

-- ──────────────────────────────────────────────────────────────
-- EJEMPLO con múltiples pacientes a la vez:
-- INSERT INTO patient_profiles (user_id, slug, nombre) VALUES
--   ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'ioanis-patsias',   'Ioanis Patsias'),
--   ('yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', 'diego-lopez',       'Diego López'),
--   ('zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', 'george-alarcon',   'George Alarcón');
