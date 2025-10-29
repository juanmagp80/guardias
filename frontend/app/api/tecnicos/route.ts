import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('Fetching tecnicos...');
    
    const { data, error } = await supabase
      .from('tecnicos')
      .select('*')
      .order('nombre', { ascending: true });

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Returning data:', data);
    return NextResponse.json(data);
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