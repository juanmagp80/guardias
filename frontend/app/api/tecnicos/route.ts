import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('[TECNICOS API] Iniciando consulta...');
    
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('[TECNICOS API] Supabase error:', error);
      throw error;
    }

    console.log('[TECNICOS API] Datos obtenidos:', data?.length, 'registros');
    
    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en API de tecnicos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        details: error
      },
      { status: 500 }
    );
  }
}