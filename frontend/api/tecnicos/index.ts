import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('tecnicos')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;

      res.status(200).json({
        success: true,
        data: data
      });
    } 
    else if (req.method === 'PUT') {
      const { id } = req.query;
      const { dias_pendientes } = req.body;

      if (!id || dias_pendientes === undefined) {
        return res.status(400).json({
          success: false,
          error: 'ID y dias_pendientes son requeridos'
        });
      }

      const { data, error } = await supabase
        .from('tecnicos')
        .update({ 
          dias_pendientes: parseInt(dias_pendientes),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      res.status(200).json({
        success: true,
        data: data[0]
      });
    }
    else {
      res.status(405).json({
        success: false,
        error: 'Método no permitido'
      });
    }
  } catch (error: any) {
    console.error('Error en /api/tecnicos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
}