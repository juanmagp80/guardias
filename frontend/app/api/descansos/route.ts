import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('descansos')
      .select(`
        *,
        tecnico:tecnicos(nombre)
      `)
      .order('fecha', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
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

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creando descanso:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}