// Netlify Function - Numerología Completa (16 endpoints)
// Proxy seguro para RapidAPI

const fetch = require('node-fetch');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    const body = JSON.parse(event.body || '{}');
    const { endpoint, birthdate, full_name } = body;
    
    // Validación
    if (!endpoint || !birthdate) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          ok: false,
          error: 'endpoint y birthdate son requeridos'
        })
      };
    }
    
    const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
    const RAPIDAPI_HOST = 'the-numerology-api.p.rapidapi.com';
    
    if (!RAPIDAPI_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          ok: false,
          error: 'RAPIDAPI_KEY no configurada'
        })
      };
    }
    
    console.log(`[numerologia] Consultando ${endpoint} para ${birthdate}`);
    
    // Preparar body
    const requestBody = {
      birthdate,
      full_name: full_name || 'Unknown'
    };
    
    // Llamar a RapidAPI
    const response = await fetch(`https://${RAPIDAPI_HOST}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      },
      body: JSON.stringify(requestBody),
      timeout: 10000
    });
    
    console.log(`[numerologia] Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No details');
      console.error(`[numerologia] Error body:`, errorText);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          ok: false,
          error: `RapidAPI error: ${response.status}`
        })
      };
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        data,
        endpoint
      })
    };
    
  } catch (error) {
    console.error('[numerologia] Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: error.message
      })
    };
  }
};
