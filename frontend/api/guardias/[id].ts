import { supabase } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido'
    });
  }

  try {
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
  } catch (error) {
    console.error('Error eliminando guardia:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando guardia',
      message: error.message
    });
  }
}