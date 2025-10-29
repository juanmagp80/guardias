import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
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
        .from('descansos')
        .select(`
          *,
          tecnicos (
            id,
            nombre,
            email
          )
        `)
        .order('fecha');

      if (error) throw error;

      res.status(200).json({
        success: true,
        data: data
      });
    }
    else if (req.method === 'POST') {
      const { tecnico_id, fecha } = req.body;

      if (!tecnico_id || !fecha) {
        return res.status(400).json({
          success: false,
          error: 'tecnico_id y fecha son requeridos'
        });
      }

      const descanso = {
        tecnico_id,
        fecha
      };

      const { data, error } = await supabase
        .from('descansos')
        .insert([descanso])
        .select(`
          *,
          tecnicos (
            id,
            nombre,
            email
          )
        `);

      if (error) throw error;

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

      const { error } = await supabase
        .from('descansos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({
        success: true,
        message: 'Descanso eliminado correctamente'
      });
    }
    else {
      res.status(405).json({
        success: false,
        error: 'Método no permitido'
      });
    }
  } catch (error) {
    console.error('Error en /api/descansos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}