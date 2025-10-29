import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('guardias')
        .select(`
          *,
          tecnicos (
            id,
            nombre,
            email
          )
        `)
        .order('fecha_inicio');

      if (error) throw error;

      res.status(200).json({
        success: true,
        data: data
      });
    }
    else if (req.method === 'POST') {
      const { tecnico_id, fecha_inicio } = req.body;

      if (!tecnico_id || !fecha_inicio) {
        return res.status(400).json({
          success: false,
          error: 'tecnico_id y fecha_inicio son requeridos'
        });
      }

      // Calcular fecha_fin (6 días después)
      const fechaInicio = new Date(fecha_inicio);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaFin.getDate() + 6);

      const guardia = {
        tecnico_id,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('guardias')
        .insert([guardia])
        .select(`
          *,
          tecnicos (
            id,
            nombre,
            email
          )
        `);

      if (error) throw error;

      // Incrementar días pendientes del técnico
      const { error: updateError } = await supabase
        .from('tecnicos')
        .update({ 
          dias_pendientes: supabase.raw('dias_pendientes + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', tecnico_id);

      if (updateError) {
        console.error('Error actualizando días pendientes:', updateError);
      }

      res.status(201).json({
        success: true,
        data: data[0]
      });
    }
    else if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID es requerido'
        });
      }

      // Obtener la guardia antes de eliminarla para decrementar días pendientes
      const { data: guardiaData, error: getError } = await supabase
        .from('guardias')
        .select('tecnico_id')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      const { error } = await supabase
        .from('guardias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Decrementar días pendientes del técnico
      const { error: updateError } = await supabase
        .from('tecnicos')
        .update({ 
          dias_pendientes: supabase.raw('GREATEST(dias_pendientes - 1, 0)'),
          updated_at: new Date().toISOString()
        })
        .eq('id', guardiaData.tecnico_id);

      if (updateError) {
        console.error('Error actualizando días pendientes:', updateError);
      }

      res.status(200).json({
        success: true,
        message: 'Guardia eliminada correctamente'
      });
    }
    else {
      res.status(405).json({
        success: false,
        error: 'Método no permitido'
      });
    }
  } catch (error: any) {
    console.error('Error en /api/guardias:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}