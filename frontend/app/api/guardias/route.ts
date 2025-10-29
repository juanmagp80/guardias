import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('[GUARDIAS API] Iniciando consulta...');
    
    const { data, error } = await supabase
      .from('guardias')
      .select('*')
      .order('fecha_inicio', { ascending: false });
      
    console.log('[GUARDIAS API] Resultado:', { data: data?.length, error });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data
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

