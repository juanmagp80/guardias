import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('[DESCANSOS API] Iniciando consulta...');
    
    // Crear cliente directamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('descansos')
      .select('*');
      
    console.log('[DESCANSOS API] Resultado:', { data: data?.length, error });

    if (error) {
      console.error('[DESCANSOS API] Error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        data: []
      });
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error en API de descansos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { tecnico_id, fecha } = await request.json();
    
    // Crear cliente directamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    const { data, error } = await supabase
      .from('descansos')
      .insert([
        { tecnico_id, fecha, procesado: false }
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error creando descanso:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}