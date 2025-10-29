import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// GET /api/descansos - Obtener todos los descansos
router.get('/', async (req, res) => {
  try {
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

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error al obtener descansos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener descansos',
      message: error.message
    });
  }
});

// POST /api/descansos - Crear descanso
router.post('/', async (req, res) => {
  try {
    const { tecnico_id, fecha } = req.body;

    if (!tecnico_id || !fecha) {
      return res.status(400).json({
        success: false,
        error: 'tecnico_id y fecha son requeridos'
      });
    }

    // Verificar que el técnico tenga días pendientes
    const { data: tecnicoData, error: tecnicoError } = await supabase
      .from('tecnicos')
      .select('dias_pendientes')
      .eq('id', tecnico_id)
      .single();

    if (tecnicoError) throw tecnicoError;

    if (tecnicoData.dias_pendientes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'El técnico no tiene días pendientes disponibles'
      });
    }

    // Crear el descanso
    const { data: descansoData, error: descansoError } = await supabase
      .from('descansos')
      .insert([{
        tecnico_id,
        fecha
      }])
      .select();

    if (descansoError) throw descansoError;

    // Decrementar días pendientes del técnico
    const { error: updateError } = await supabase
      .from('tecnicos')
      .update({ dias_pendientes: tecnicoData.dias_pendientes - 1 })
      .eq('id', tecnico_id);

    if (updateError) throw updateError;

    res.status(201).json({
      success: true,
      data: descansoData[0]
    });
  } catch (error) {
    console.error('Error al crear descanso:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear descanso',
      message: error.message
    });
  }
});

// DELETE /api/descansos/:id - Eliminar descanso
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el descanso para saber el técnico
    const { data: descansoData, error: getError } = await supabase
      .from('descansos')
      .select('tecnico_id')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Eliminar el descanso
    const { error: deleteError } = await supabase
      .from('descansos')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Incrementar días pendientes del técnico
    const { data: tecnicoData, error: tecnicoError } = await supabase
      .from('tecnicos')
      .select('dias_pendientes')
      .eq('id', descansoData.tecnico_id)
      .single();

    if (tecnicoError) throw tecnicoError;

    const { error: updateError } = await supabase
      .from('tecnicos')
      .update({ dias_pendientes: tecnicoData.dias_pendientes + 1 })
      .eq('id', descansoData.tecnico_id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Descanso eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar descanso:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar descanso',
      message: error.message
    });
  }
});

export default router;
