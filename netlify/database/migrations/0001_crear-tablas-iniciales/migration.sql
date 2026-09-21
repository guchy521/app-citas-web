-- Write your migration SQL here
--
-- Example:
--   CREATE TABLE IF NOT EXISTS users (
--     id SERIAL PRIMARY KEY,
--     name TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT NOW()
--   );
CREATE TABLE IF NOT EXISTS negocios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  color_primario TEXT DEFAULT '#1B4332',
  color_secundario TEXT DEFAULT '#B08947',
  color_acento TEXT DEFAULT '#E8DCC8',
  color_texto TEXT DEFAULT '#1A1A1A',
  horario_apertura TEXT DEFAULT '09:00',
  horario_cierre TEXT DEFAULT '18:00',
  intervalo_turnos_minutos INT DEFAULT 60,
  anticipacion_minima_horas INT DEFAULT 1,
  dias_max_anticipacion INT DEFAULT 30,
  moneda TEXT DEFAULT 'USD',
  mensaje_whatsapp_confirmacion TEXT,
  mensaje_whatsapp_cancelacion TEXT,
  admin_pin_hash TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio NUMERIC DEFAULT 0,
  duracion_horas NUMERIC DEFAULT 1,
  activo BOOLEAN DEFAULT true,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS citas (
  id SERIAL PRIMARY KEY,
  negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre_cliente TEXT NOT NULL,
  servicio TEXT NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  tiempo_horas NUMERIC NOT NULL,
  costo NUMERIC NOT NULL,
  estado_pago TEXT DEFAULT 'Pendiente',
  fecha_registro TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS solicitudes (
  id SERIAL PRIMARY KEY,
  negocio_id INT NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre_cliente TEXT NOT NULL,
  servicio TEXT NOT NULL,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_registro TIMESTAMPTZ DEFAULT now()
);