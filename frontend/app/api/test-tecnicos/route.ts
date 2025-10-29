import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('=== Testing Supabase connection ===');
    
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    console.log('Variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      url: supabaseUrl,
      keyLength: supabaseKey?.length
    });

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(`Missing Supabase credentials: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`);
    }

    // Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created');

    // Hacer query
    console.log('Making query to tecnicos table...');
    const { data, error, status, statusText } = await supabase
      .from('tecnicos')
      .select('*')
      .order('nombre', { ascending: true });

    console.log('Query result:', {
      data: data?.length ? `${data.length} records` : 'No data',
      error,
      status,
      statusText
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: 'Supabase error',
        details: error,
        status,
        statusText
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      data: data,
      message: 'Query successful'
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}