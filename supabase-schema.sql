-- Esquema de base de datos para MCP Guardias Sevilla
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla de técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    dias_pendientes INTEGER DEFAULT 0 CHECK (dias_pendientes >= 0),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de guardias
CREATE TABLE IF NOT EXISTS guardias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tecnico_id UUID NOT NULL REFERENCES tecnicos(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    evento_calendar_id VARCHAR(255), -- ID del evento en Google Calendar
    estado VARCHAR(50) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fecha_fin_posterior_inicio CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT unique_tecnico_fecha UNIQUE (tecnico_id, fecha_inicio)
);

-- 3. Tabla de descansos
CREATE TABLE IF NOT EXISTS descansos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tecnico_id UUID NOT NULL REFERENCES tecnicos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    evento_calendar_id VARCHAR(255), -- ID del evento en Google Calendar
    guardia_relacionada UUID REFERENCES guardias(id), -- Opcional: relacionar con guardia específica
    estado VARCHAR(50) DEFAULT 'programado' CHECK (estado IN ('programado', 'disfrutado', 'cancelado')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_tecnico_descanso_fecha UNIQUE (tecnico_id, fecha)
);

-- 4. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_guardias_tecnico_fecha ON guardias(tecnico_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_descansos_tecnico_fecha ON descansos(tecnico_id, fecha);
CREATE INDEX IF NOT EXISTS idx_tecnicos_pendientes ON tecnicos(dias_pendientes) WHERE dias_pendientes > 0;
CREATE INDEX IF NOT EXISTS idx_guardias_estado ON guardias(estado);
CREATE INDEX IF NOT EXISTS idx_descansos_estado ON descansos(estado);

-- 5. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger para actualizar updated_at en tecnicos
DROP TRIGGER IF EXISTS update_tecnicos_updated_at ON tecnicos;
CREATE TRIGGER update_tecnicos_updated_at
    BEFORE UPDATE ON tecnicos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Función para obtener estadísticas rápidas
CREATE OR REPLACE FUNCTION obtener_estadisticas_rapidas()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_tecnicos', (SELECT COUNT(*) FROM tecnicos WHERE activo = true),
        'total_guardias_ano', (SELECT COUNT(*) FROM guardias WHERE EXTRACT(YEAR FROM fecha_inicio) = EXTRACT(YEAR FROM NOW())),
        'total_descansos_ano', (SELECT COUNT(*) FROM descansos WHERE EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM NOW())),
        'total_dias_pendientes', (SELECT COALESCE(SUM(dias_pendientes), 0) FROM tecnicos WHERE activo = true),
        'tecnicos_con_pendientes', (SELECT COUNT(*) FROM tecnicos WHERE dias_pendientes > 0 AND activo = true),
        'guardias_este_mes', (
            SELECT COUNT(*) FROM guardias 
            WHERE EXTRACT(YEAR FROM fecha_inicio) = EXTRACT(YEAR FROM NOW())
            AND EXTRACT(MONTH FROM fecha_inicio) = EXTRACT(MONTH FROM NOW())
        ),
        'descansos_este_mes', (
            SELECT COUNT(*) FROM descansos 
            WHERE EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM NOW())
            AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM NOW())
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. Vista para resumen de técnicos
CREATE OR REPLACE VIEW vista_resumen_tecnicos AS
SELECT 
    t.id,
    t.nombre,
    t.email,
    t.dias_pendientes,
    t.activo,
    COUNT(g.id) as total_guardias,
    COUNT(d.id) as total_descansos,
    MAX(g.fecha_inicio) as ultima_guardia,
    MAX(d.fecha) as ultimo_descanso,
    t.created_at,
    t.updated_at
FROM tecnicos t
LEFT JOIN guardias g ON t.id = g.tecnico_id
LEFT JOIN descansos d ON t.id = d.tecnico_id
WHERE t.activo = true
GROUP BY t.id, t.nombre, t.email, t.dias_pendientes, t.activo, t.created_at, t.updated_at
ORDER BY t.nombre;

-- 9. Función para validar fechas de guardias
CREATE OR REPLACE FUNCTION validar_guardia_fechas()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar que la fecha de inicio no sea en el pasado
    IF NEW.fecha_inicio < CURRENT_DATE THEN
        RAISE EXCEPTION 'No se pueden programar guardias en fechas pasadas';
    END IF;
    
    -- Verificar que no haya solapamiento con otras guardias del mismo técnico
    IF EXISTS (
        SELECT 1 FROM guardias 
        WHERE tecnico_id = NEW.tecnico_id 
        AND id != COALESCE(NEW.id, gen_random_uuid())
        AND estado != 'cancelada'
        AND (
            (fecha_inicio <= NEW.fecha_inicio AND fecha_fin >= NEW.fecha_inicio) OR
            (fecha_inicio <= NEW.fecha_fin AND fecha_fin >= NEW.fecha_fin) OR
            (fecha_inicio >= NEW.fecha_inicio AND fecha_fin <= NEW.fecha_fin)
        )
    ) THEN
        RAISE EXCEPTION 'El técnico ya tiene una guardia programada en fechas que se solapan';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger para validar guardias
DROP TRIGGER IF EXISTS trigger_validar_guardia_fechas ON guardias;
CREATE TRIGGER trigger_validar_guardia_fechas
    BEFORE INSERT OR UPDATE ON guardias
    FOR EACH ROW
    EXECUTE FUNCTION validar_guardia_fechas();

-- 11. Función para validar fechas de descansos
CREATE OR REPLACE FUNCTION validar_descanso_fechas()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar que la fecha no sea en el pasado
    IF NEW.fecha < CURRENT_DATE THEN
        RAISE EXCEPTION 'No se pueden programar descansos en fechas pasadas';
    END IF;
    
    -- Verificar que el técnico tenga días pendientes (solo en INSERT)
    IF TG_OP = 'INSERT' THEN
        IF (SELECT dias_pendientes FROM tecnicos WHERE id = NEW.tecnico_id) <= 0 THEN
            RAISE EXCEPTION 'El técnico no tiene días de descanso pendientes';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Trigger para validar descansos
DROP TRIGGER IF EXISTS trigger_validar_descanso_fechas ON descansos;
CREATE TRIGGER trigger_validar_descanso_fechas
    BEFORE INSERT OR UPDATE ON descansos
    FOR EACH ROW
    EXECUTE FUNCTION validar_descanso_fechas();

-- 13. Insertar algunos técnicos de ejemplo (opcional)
INSERT INTO tecnicos (nombre, email, dias_pendientes) VALUES 
    ('Juan Martínez', 'juan.martinez@empresa.com', 3),
    ('Ana García', 'ana.garcia@empresa.com', 1),
    ('Carlos López', 'carlos.lopez@empresa.com', 5),
    ('María Rodríguez', 'maria.rodriguez@empresa.com', 2)
ON CONFLICT (email) DO NOTHING;

-- 14. Configurar RLS (Row Level Security) - Opcional para seguridad
-- ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE guardias ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE descansos ENABLE ROW LEVEL SECURITY;

-- Política básica para permitir todas las operaciones (ajustar según necesidades)
-- CREATE POLICY "Allow all operations" ON tecnicos FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON guardias FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON descansos FOR ALL USING (true);

COMMIT;