import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('guardias')
      .select(`
        *,
        tecnico:tecnicos(nombre)
      `)
      .order('fecha_inicio', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
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

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creando guardia:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

