import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[DESCANSOS TEMP] Devolviendo array vacío');
  return NextResponse.json({
    success: true,
    data: []
  });
}

export async function POST() {
  console.log('[DESCANSOS TEMP] POST recibido');
  return NextResponse.json({
    success: true,
    data: { id: 'temp', message: 'API temporal - funcionalidad limitada' }
  });
}