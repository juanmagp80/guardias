import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('[GUARDIAS API] Iniciando consulta...');
    
    // Crear cliente directamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('guardias')
      .select('*');
      
    console.log('[GUARDIAS API] Resultado:', { data: data?.length, error });

    if (error) {
      console.error('[GUARDIAS API] Error:', error);
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
    console.error('Error en API de guardias:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { tecnico_id, fecha_inicio } = await request.json();
    
    // Crear cliente directamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    
    const { data, error } = await supabase
      .from('guardias')
      .insert([
        { tecnico_id, fecha_inicio }
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
    console.error('Error creando guardia:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

