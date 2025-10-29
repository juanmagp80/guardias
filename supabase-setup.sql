-- Script SQL para ejecutar en Supabase SQL Editor
-- Copia y pega este contenido en el SQL Editor de Supabase

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
    evento_calendar_id VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fecha_fin_posterior_inicio CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT unique_tecnico_fecha UNIQUE (tecnico_id, fecha_inicio)
);

-- 3. Tabla de descansos
CREATE TABLE IF NOT EXISTS descansos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tecnico_id UUID NOT NULL REFERENCES tecnicos(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    evento_calendar_id VARCHAR(255),
    guardia_relacionada UUID REFERENCES guardias(id),
    estado VARCHAR(50) DEFAULT 'programado' CHECK (estado IN ('programado', 'disfrutado', 'cancelado')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_tecnico_descanso_fecha UNIQUE (tecnico_id, fecha)
);

-- 4. Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_guardias_tecnico_fecha ON guardias(tecnico_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_descansos_tecnico_fecha ON descansos(tecnico_id, fecha);
CREATE INDEX IF NOT EXISTS idx_tecnicos_pendientes ON tecnicos(dias_pendientes) WHERE dias_pendientes > 0;

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

-- 7. Insertar técnicos de ejemplo
INSERT INTO tecnicos (nombre, email, dias_pendientes) VALUES 
    ('Juan Martínez', 'juan.martinez@empresa.com', 3),
    ('Ana García', 'ana.garcia@empresa.com', 1),
    ('Carlos López', 'carlos.lopez@empresa.com', 5),
    ('María Rodríguez', 'maria.rodriguez@empresa.com', 2)
ON CONFLICT (email) DO NOTHING;