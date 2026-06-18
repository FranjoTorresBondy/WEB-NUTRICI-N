-- ══════════════════════════════════════════════════════════════
-- SETUP COMPLETO — Portal Paciente + Admin
-- Franjo Torres · Nutrición Deportiva
-- Ejecutar en Supabase: Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 1. PACIENTES
--    Franjo crea un registro aquí por cada paciente.
--    Se vincula con el usuario de Auth por user_id.
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacientes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email       TEXT,
  nombre      TEXT NOT NULL,
  deporte     TEXT,
  telefono    TEXT,
  fecha_nac   DATE,
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 2. PLANES NUTRICIONALES
--    Creados desde admin/plan.html
--    El paciente los lee en el portal
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS planes (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id    UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  paciente_email TEXT,
  nombre         TEXT,
  tipo_dieta     TEXT,           -- "Normocalórico, hiperproteico"
  calorias       INTEGER,
  proteinas      NUMERIC,
  carbohidratos  NUMERIC,
  grasas         NUMERIC,
  fecha_inicio   DATE DEFAULT CURRENT_DATE,
  activo         BOOLEAN DEFAULT TRUE,
  dias           JSONB,          -- estructura de comidas por día
  guias          TEXT[],         -- indicaciones generales
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. PLANES DE ENTRENAMIENTO
--    Generados desde admin/entrenamiento.html
--    El paciente los lee en su portal
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entrenamientos (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id    UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  paciente_email TEXT,
  nombre         TEXT NOT NULL,  -- "Hipertrofia — Juan Pérez"
  semanas        INTEGER,
  activo         BOOLEAN DEFAULT TRUE,
  contenido      JSONB,          -- array de semanas con sesiones y ejercicios
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 4. MEDICIONES ISAK
--    Registradas desde admin/antropometria.html
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mediciones (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id       UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  paciente_email    TEXT,
  fecha             DATE NOT NULL,
  -- Datos generales
  peso              NUMERIC,
  talla             NUMERIC,
  imc               NUMERIC,
  -- Pliegues cutáneos (mm)
  tricipital        NUMERIC,
  subescapular      NUMERIC,
  bicipital         NUMERIC,
  iliocrest         NUMERIC,
  supraespinal      NUMERIC,
  abdominal         NUMERIC,
  muslo_anterior    NUMERIC,
  pierna_medial     NUMERIC,
  suma_8_pliegues   NUMERIC,
  porcentaje_grasa  NUMERIC,
  -- Circunferencias (cm)
  cintura           NUMERIC,
  cadera            NUMERIC,
  muslo_der         NUMERIC,
  brazo_relajado    NUMERIC,
  brazo_flex        NUMERIC,
  pierna_medial_c   NUMERIC,
  notas             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 5. REGISTRO DIARIO
--    El paciente lo llena desde su portal
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registro_diario (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id  UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha        DATE NOT NULL,
  peso         NUMERIC,
  energia      TEXT,             -- '1' a '5'
  horas_sueno  NUMERIC,
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fecha)
);


-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE pacientes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrenamientos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediciones      ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_diario ENABLE ROW LEVEL SECURITY;

-- ── PACIENTES ──
-- El paciente ve solo su perfil
CREATE POLICY "paciente_lee_su_perfil" ON pacientes
  FOR SELECT USING (auth.uid() = user_id);

-- Admin (service_role) tiene acceso total por defecto (RLS no aplica a service_role)
-- Para que el admin con anon key pueda leer/escribir, necesita política propia.
-- OPCIÓN: deshabilita RLS solo en tablas del admin si usas clave anon desde el admin panel.
-- Aquí usamos una política que permite al creador (Franjo) leer todo:
CREATE POLICY "admin_acceso_total_pacientes" ON pacientes
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'franjo.torres.b@gmail.com'
  );

-- ── PLANES ──
CREATE POLICY "paciente_lee_su_plan" ON planes
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE user_id = auth.uid())
    OR paciente_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "admin_acceso_total_planes" ON planes
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'franjo.torres.b@gmail.com'
  );

-- ── ENTRENAMIENTOS ──
CREATE POLICY "paciente_lee_su_entrenamiento" ON entrenamientos
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE user_id = auth.uid())
    OR paciente_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "admin_acceso_total_entrenamientos" ON entrenamientos
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'franjo.torres.b@gmail.com'
  );

-- ── MEDICIONES ──
CREATE POLICY "paciente_lee_sus_mediciones" ON mediciones
  FOR SELECT USING (
    paciente_id IN (SELECT id FROM pacientes WHERE user_id = auth.uid())
    OR paciente_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "admin_acceso_total_mediciones" ON mediciones
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'franjo.torres.b@gmail.com'
  );

-- ── REGISTRO DIARIO ──
CREATE POLICY "paciente_lee_su_registro" ON registro_diario
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "paciente_inserta_registro" ON registro_diario
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "paciente_actualiza_registro" ON registro_diario
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "admin_acceso_total_registro" ON registro_diario
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'franjo.torres.b@gmail.com'
  );


-- ══════════════════════════════════════════════════════════════
-- EJEMPLO: Crear el primer paciente manualmente
-- Reemplaza los valores con los datos reales
-- ══════════════════════════════════════════════════════════════
/*
-- Primero crea el usuario en Authentication → Users → "Invite user"
-- Luego vincula aquí con el UUID que te da Supabase:

INSERT INTO pacientes (user_id, email, nombre, deporte)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- UUID del usuario en Auth
  'paciente@ejemplo.com',
  'Nombre Completo',
  'mma'   -- mma | endurance | triatlon | boxeo | crossfit | fisico | otro
);
*/

-- ─────────────────────────────────────────
-- 6. REGISTROS DE ENTRENAMIENTO
--    El paciente los llena desde su portal
--    Guarda: micro, sesión, ejercicio, serie, peso y reps
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registros_entrenamiento (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id       UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  entrenamiento_id  UUID REFERENCES entrenamientos(id) ON DELETE CASCADE,
  fecha             DATE NOT NULL DEFAULT CURRENT_DATE,
  microciclo        INTEGER NOT NULL,
  sesion_id         TEXT NOT NULL,
  ejercicio_idx     INTEGER NOT NULL,
  ejercicio_nombre  TEXT,
  serie             INTEGER NOT NULL,
  peso              NUMERIC,
  reps              INTEGER,
  notas             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_reg_ent UNIQUE(user_id, entrenamiento_id, microciclo, sesion_id, ejercicio_idx, serie)
);

ALTER TABLE registros_entrenamiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paciente_lee_sus_registros_ent" ON registros_entrenamiento
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "paciente_inserta_registros_ent" ON registros_entrenamiento
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "paciente_actualiza_registros_ent" ON registros_entrenamiento
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "admin_acceso_total_registros_ent" ON registros_entrenamiento
  FOR ALL USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'franjo.torres.b@gmail.com'
  );

-- ─────────────────────────────────────────
-- FORMATO del campo contenido en entrenamientos
-- para planes tipo mesociclo (nuevo formato):
-- {
--   "tipo": "mesociclo",
--   "microciclos": 5,
--   "rir_micro": [
--     {"compound": 2, "accessory": 1, "core": 0},
--     {"compound": 2, "accessory": 1, "core": 0},
--     {"compound": 1, "accessory": 0, "core": 0},
--     {"compound": 1, "accessory": 0, "core": 0},
--     {"compound": 1, "accessory": 0, "core": 0}
--   ],
--   "sesiones": [
--     {
--       "id": "lower",
--       "nombre": "Sesión 1 — Lower",
--       "tag": "Tren inferior · Pierna + Core",
--       "icono": "🦵",
--       "ejercicios": [
--         {"nombre": "Hack squat", "series": 2, "reps": "6", "tipo": "C", "descanso": "3:00"},
--         ...
--       ]
--     },
--     ...
--   ]
-- }
-- tipo C = compuesto, A = accesorio, X = core/aislamiento
-- ─────────────────────────────────────────
