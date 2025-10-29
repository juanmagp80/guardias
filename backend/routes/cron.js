import express from 'express';
import { supabase } from '../config/database.js';

const router = express.Router();

// Función para procesar descansos del día actual
export async function processDueDescansos() {
  const today = new Date().toISOString().split('T')[0];
  console.log('[cron] Procesando descansos para:', today);

  try {
    const { data: descansos, error: selectError } = await supabase
      .from('descansos')
      .select('id, tecnico_id, fecha, procesado')
      .eq('fecha', today);

    if (selectError) throw selectError;

    if (!Array.isArray(descansos) || descansos.length === 0) {
      console.log('[cron] No hay descansos para procesar hoy.');
      return { processed: 0 };
    }

    let processedCount = 0;

    for (const d of descansos) {
      // Si ya está marcado como procesado, saltar
      if (d.procesado === true) continue;

      // Obtener días pendientes actuales
      const { data: tecnicoData, error: tecnicoError } = await supabase
        .from('tecnicos')
        .select('dias_pendientes')
        .eq('id', d.tecnico_id)
        .single();

      if (tecnicoError) {
        console.error('[cron] Error obteniendo técnico:', tecnicoError);
        continue;
      }

      const nuevosDias = Math.max(0, (tecnicoData?.dias_pendientes || 0) - 1);

      const { error: updateTecError } = await supabase
        .from('tecnicos')
        .update({ dias_pendientes: nuevosDias })
        .eq('id', d.tecnico_id);

      if (updateTecError) {
        console.error('[cron] Error actualizando días pendientes:', updateTecError);
        continue;
      }

      // Intentar marcar el descanso como procesado. Si la columna no existe,
      // esto fallará y lo capturamos abajo para informar al usuario.
      const { error: markError } = await supabase
        .from('descansos')
        .update({ procesado: true, procesado_at: new Date().toISOString() })
        .eq('id', d.id);

      if (markError) {
        // Si falla al marcar, registramos pero no revertimos el decremento.
        console.error('[cron] No se pudo marcar descanso como procesado. Ejecuta la migración SQL para añadir la columna `procesado` en la tabla `descansos`. Error:', markError);
        throw markError;
      }

      processedCount++;
    }

    console.log(`[cron] Procesados ${processedCount} descansos.`);
    return { processed: processedCount };
  } catch (error) {
    console.error('[cron] Error procesando descansos:', error);
    throw error;
  }
}

// Endpoint para ejecutar manualmente el job
router.post('/process-descansos', async (req, res) => {
  try {
    const result = await processDueDescansos();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || String(error) });
  }
});

export default router;
