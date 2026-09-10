const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      },
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

  const chave = process.env.NVIDIA_API_KEY;
  if (!chave) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { message: 'NVIDIA_API_KEY não configurada no ambiente da Netlify.' } })
    };
  }

  try {
    const corpo = JSON.parse(event.body || '{}');

    const resposta = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${chave}`
      },
      body: JSON.stringify(corpo)
    });

    const dados = await resposta.text();

    return {
      statusCode: resposta.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      },
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
