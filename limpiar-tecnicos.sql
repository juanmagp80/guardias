    -- Script para limpiar la base de datos y crear los técnicos reales
    -- Ejecutar en Supabase SQL Editor

    -- 1. Eliminar todos los datos existentes (en orden por las relaciones)
    DELETE FROM descansos;
    DELETE FROM guardias;
    DELETE FROM tecnicos;

    -- 2. Reiniciar las secuencias si existen
    -- (Los UUIDs no necesitan reinicio)

    -- 3. Insertar los técnicos reales del equipo de Sevilla
    INSERT INTO tecnicos (nombre, email, dias_pendientes) VALUES 
        ('José Rodríguez Aguayo', 'jose.rodriguez@empresa.com', 0),
        ('José Luis Noval Hillán', 'joseluis.noval@empresa.com', 0),
        ('José Manuel Carmona Córdoba', 'josemanuel.carmona@empresa.com', 0)
    ON CONFLICT (email) DO NOTHING;

    -- 4. Verificar la inserción
    SELECT * FROM tecnicos ORDER BY nombre;