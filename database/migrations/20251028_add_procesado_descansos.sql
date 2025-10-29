-- Añadir columnas para marcar descansos procesados
ALTER TABLE IF EXISTS descansos
  ADD COLUMN IF NOT EXISTS procesado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS procesado_at TIMESTAMP WITH TIME ZONE NULL;

-- (Opcional) crear índice para búsquedas por fecha y procesado
CREATE INDEX IF NOT EXISTS idx_descansos_fecha_procesado ON descansos(fecha, procesado);