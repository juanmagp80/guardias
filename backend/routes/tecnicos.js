import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// GET /api/tecnicos - Obtener todos los técnicos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .order('nombre');

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener técnicos',
      message: error.message
    });
  }
});

// PUT /api/tecnicos/:id/dias-pendientes - Actualizar días pendientes
router.put('/:id/dias-pendientes', async (req, res) => {
  try {
    const { id } = req.params;
    const { dias_pendientes } = req.body;

    if (dias_pendientes === undefined) {
      return res.status(400).json({
        success: false,
        error: 'dias_pendientes es requerido'
      });
    }

    const { data, error } = await supabase
      .from('tecnicos')
      .update({ dias_pendientes })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data.length) {
      return res.status(404).json({
        success: false,
        error: 'Técnico no encontrado'
      });
    }

    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error al actualizar días pendientes:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar días pendientes',
      message: error.message
    });
  }
});

export default router;
