const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { message: 'Método não permitido.' } })
    };
  }

  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { message: 'GEMINI_API_KEY não configurada no ambiente da Netlify.' } })
    };
  }

  try {
    const corpo = JSON.parse(event.body || '{}');
    const { model, ...resto } = corpo;
    const modeloFinal = model || 'gemini-3.6-flash';

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modeloFinal}:generateContent?key=${encodeURIComponent(chave)}`;

    const resposta = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resto)
    });

    const dados = await resposta.text();

    return {
      statusCode: resposta.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: dados
    };
  } catch (erro) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { message: erro.message } })
    };
  }
};

