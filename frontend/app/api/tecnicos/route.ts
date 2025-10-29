import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('[TECNICOS API] Iniciando consulta...');
    
    // Crear cliente directamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('[TECNICOS API] Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        data: []
      });
    }

    console.log('[TECNICOS API] Datos obtenidos:', data?.length, 'registros');
    
    return NextResponse.json({
      success: true,
      data: data || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[TECNICOS API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        data: []
      },
      { status: 500 }
    );
  }
}