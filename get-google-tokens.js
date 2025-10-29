#!/usr/bin/env node

/**
 * Script para obtener Access Token y Refresh Token de Google Calendar
 * Ejecutar: node get-google-tokens.js
 */

import { google } from 'googleapis';
import readline from 'readline';
import fs from 'fs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

async function getTokens() {
  console.log('🔐 Obteniendo tokens de Google Calendar API...\n');

  // Verificar que tenemos las credenciales necesarias
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env');
    process.exit(1);
  }

  // Crear cliente OAuth2
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob' // OOB (Out of Band) para aplicaciones desktop/scripts
  );

  // Generar URL de autorización
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Fuerza mostrar pantalla de consentimiento para obtener refresh token
  });

  console.log('📋 Pasos para obtener los tokens:');
  console.log('1. Abre esta URL en tu navegador:');
  console.log(`\n🔗 ${authUrl}\n`);
  console.log('2. Autoriza la aplicación');
  console.log('3. Copia el código de autorización que aparece\n');

  // Leer código de autorización
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const code = await new Promise((resolve) => {
      rl.question('📝 Pega el código de autorización aquí: ', resolve);
    });

    console.log('\n⏳ Intercambiando código por tokens...');

    // Intercambiar código por tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ ¡Tokens obtenidos exitosamente!');
    console.log('\n📄 Tokens generados:');
    console.log(`Access Token: ${tokens.access_token}`);
    console.log(`Refresh Token: ${tokens.refresh_token}`);
    console.log(`Expira en: ${new Date(tokens.expiry_date).toLocaleString('es-ES')}`);

    // Actualizar archivo .env
    await updateEnvFile(tokens);

    // Probar la conexión
    await testConnection(tokens);

  } catch (error) {
    console.error('❌ Error obteniendo tokens:', error.message);
  } finally {
    rl.close();
  }
}

async function updateEnvFile(tokens) {
  try {
    console.log('\n🔧 Actualizando archivo .env...');
    
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Actualizar tokens
    envContent = envContent.replace(
      /GOOGLE_ACCESS_TOKEN=.*/,
      `GOOGLE_ACCESS_TOKEN=${tokens.access_token}`
    );
    
    envContent = envContent.replace(
      /GOOGLE_REFRESH_TOKEN=.*/,
      `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`
    );

    fs.writeFileSync('.env', envContent);
    console.log('✅ Archivo .env actualizado con los nuevos tokens');
    
  } catch (error) {
    console.error('⚠️  Error actualizando .env:', error.message);
    console.log('\n📝 Agrega manualmente estas líneas a tu .env:');
    console.log(`GOOGLE_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
  }
}

async function testConnection(tokens) {
  try {
    console.log('\n🧪 Probando conexión con Google Calendar...');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'urn:ietf:wg:oauth:2.0:oob'
    );
    
    oauth2Client.setCredentials(tokens);
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Obtener lista de calendarios
    const { data } = await calendar.calendarList.list();
    
    console.log('✅ Conexión exitosa!');
    console.log(`📅 Calendarios disponibles: ${data.items?.length || 0}`);
    
    if (data.items && data.items.length > 0) {
      console.log('\n📋 Primeros calendarios:');
      data.items.slice(0, 3).forEach(cal => {
        console.log(`  - ${cal.summary} (${cal.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error probando conexión:', error.message);
  }
}

// Ejecutar
console.log('🚀 Script de configuración de Google Calendar API');
console.log('================================================\n');

getTokens().catch(console.error);