import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { dias_pendientes } = await request.json();

    const { error } = await supabase
      .from('tecnicos')
      .update({ dias_pendientes })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error actualizando días pendientes:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}