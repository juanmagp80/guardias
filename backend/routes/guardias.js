import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// GET /api/guardias - Obtener todas las guardias
router.get('/', async (req, res) => {
  try {
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

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error al obtener guardias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener guardias',
      message: error.message
    });
  }
});

// POST /api/guardias - Crear guardia (semana completa)
router.post('/', async (req, res) => {
  try {
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

    // Crear la guardia
    const { data: guardiaData, error: guardiaError } = await supabase
      .from('guardias')
      .insert([{
        tecnico_id,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0]
      }])
      .select();

    if (guardiaError) throw guardiaError;

    // Incrementar días pendientes del técnico
    const { data: tecnicoData, error: tecnicoError } = await supabase
      .from('tecnicos')
      .select('dias_pendientes')
      .eq('id', tecnico_id)
      .single();

    if (tecnicoError) throw tecnicoError;

    const { error: updateError } = await supabase
      .from('tecnicos')
      .update({ dias_pendientes: tecnicoData.dias_pendientes + 1 })
      .eq('id', tecnico_id);

    if (updateError) throw updateError;

    res.status(201).json({
      success: true,
      data: guardiaData[0]
    });
  } catch (error) {
    console.error('Error al crear guardia:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear guardia',
      message: error.message
    });
  }
});

// DELETE /api/guardias/:id - Eliminar guardia
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la guardia para saber el técnico
    const { data: guardiaData, error: getError } = await supabase
      .from('guardias')
      .select('tecnico_id')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Eliminar la guardia
    const { error: deleteError } = await supabase
      .from('guardias')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Decrementar días pendientes del técnico
    const { data: tecnicoData, error: tecnicoError } = await supabase
      .from('tecnicos')
      .select('dias_pendientes')
      .eq('id', guardiaData.tecnico_id)
      .single();

    if (tecnicoError) throw tecnicoError;

    const nuevosDiasPendientes = Math.max(0, tecnicoData.dias_pendientes - 1);
    
    const { error: updateError } = await supabase
      .from('tecnicos')
      .update({ dias_pendientes: nuevosDiasPendientes })
      .eq('id', guardiaData.tecnico_id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Guardia eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar guardia:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar guardia',
      message: error.message
    });
  }
});

export default router;
