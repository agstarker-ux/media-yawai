const { createClient } = require('@supabase/supabase-js');

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

  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !chave) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { message: 'SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.' } })
    };
  }

  try {
    const corpo = JSON.parse(event.body || '{}');
    const resumo = corpo.resumo || {};
    const supabase = createClient(url, chave);

    const { data, error } = await supabase
      .from('triagens')
      .insert({
        urgencia: corpo.urgencia || 'baixa',
        nome: resumo.nome || null,
        idade: resumo.idade || null,
        sexo: resumo.sexo || null,
        queixa: resumo.queixa || null,
        duracao: resumo.duracao || null,
        intensidade: resumo.intensidade || null,
        sintomas_adicionais: resumo.sintomas_adicionais || null,
        alergias: resumo.alergias || null,
        medicamentos_relatados: resumo.medicamentos_relatados || null,
        observacoes: resumo.observacoes || null,
        orientacao_medica: corpo.orientacao_medica || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id: data.id })
    };
  } catch (erro) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: { message: erro.message } })
    };
  }
};
