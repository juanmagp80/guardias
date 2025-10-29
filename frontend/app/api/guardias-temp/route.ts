import { NextResponse } from 'next/server';

export async function GET() {
  console.log('[GUARDIAS TEMP] Devolviendo array vacío');
  return NextResponse.json({
    success: true,
    data: []
  });
}

export async function POST() {
  console.log('[GUARDIAS TEMP] POST recibido');
  return NextResponse.json({
    success: true,
    data: { id: 'temp', message: 'API temporal - funcionalidad limitada' }
  });
}