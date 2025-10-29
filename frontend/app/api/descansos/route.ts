import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('[DESCANSOS API] Iniciando consulta...');
    
    const { data, error } = await supabase
      .from('descansos')
      .select('*')
      .order('fecha', { ascending: false });
      
    console.log('[DESCANSOS API] Resultado:', { data: data?.length, error });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data
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