#!/usr/bin/env node

/**
 * Script para verificar/configurar la base de datos de Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
  console.log('🗄️ Configurando base de datos Supabase...\n');

  try {
    // Probar conexión
    console.log('🔍 Verificando conexión...');
    const { data, error } = await supabase.from('tecnicos').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('📝 Las tablas no existen, creándolas...\n');
      await createTables();
    } else if (error) {
      console.error('❌ Error de conexión:', error.message);
      return;
    } else {
      console.log('✅ Conexión exitosa - las tablas ya existen\n');
    }

    // Verificar datos de ejemplo
    await checkSampleData();

  } catch (error) {
    console.error('❌ Error configurando base de datos:', error.message);
  }
}

async function createTables() {
  const sql = `
-- Tabla de técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    dias_pendientes INTEGER DEFAULT 0 CHECK (dias_pendientes >= 0),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de guardias
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

-- Tabla de descansos
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_guardias_tecnico_fecha ON guardias(tecnico_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_descansos_tecnico_fecha ON descansos(tecnico_id, fecha);
CREATE INDEX IF NOT EXISTS idx_tecnicos_pendientes ON tecnicos(dias_pendientes) WHERE dias_pendientes > 0;
`;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.log('ℹ️ Creando tablas manualmente...');
      // Si falla, crear tabla por tabla
      await createTablesManually();
    } else {
      console.log('✅ Tablas creadas exitosamente');
    }
  } catch (error) {
    console.log('ℹ️ Método alternativo - creando tablas una por una...');
    await createTablesManually();
  }
}

async function createTablesManually() {
  // Crear tabla tecnicos
  const { error: techError } = await supabase.rpc('exec_sql', {
    sql_query: `
      CREATE TABLE IF NOT EXISTS tecnicos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          dias_pendientes INTEGER DEFAULT 0,
          activo BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  });

  if (!techError) {
    console.log('✅ Tabla tecnicos creada');
  }
}

async function checkSampleData() {
  console.log('📊 Verificando datos de ejemplo...');
  
  const { data: tecnicos, error } = await supabase
    .from('tecnicos')
    .select('*')
    .limit(5);

  if (error) {
    console.log('⚠️ No se pudieron obtener técnicos:', error.message);
    return;
  }

  if (!tecnicos || tecnicos.length === 0) {
    console.log('📝 Insertando técnicos de ejemplo...');
    await insertSampleData();
  } else {
    console.log(`✅ ${tecnicos.length} técnicos encontrados:`);
    tecnicos.forEach(t => {
      console.log(`  - ${t.nombre} (${t.dias_pendientes} días pendientes)`);
    });
  }
}

async function insertSampleData() {
  const tecnicos = [
    { nombre: 'Juan Martínez', email: 'juan.martinez@empresa.com', dias_pendientes: 3 },
    { nombre: 'Ana García', email: 'ana.garcia@empresa.com', dias_pendientes: 1 },
    { nombre: 'Carlos López', email: 'carlos.lopez@empresa.com', dias_pendientes: 5 },
    { nombre: 'María Rodríguez', email: 'maria.rodriguez@empresa.com', dias_pendientes: 2 }
  ];

  const { data, error } = await supabase
    .from('tecnicos')
    .insert(tecnicos)
    .select();

  if (error) {
    console.log('⚠️ Error insertando datos:', error.message);
  } else {
    console.log(`✅ ${data.length} técnicos de ejemplo insertados`);
  }
}

setupDatabase();