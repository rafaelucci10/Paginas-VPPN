const SUPABASE_URL = 'https://sdjlnjqtgnodnifkbykq.supabase.co';

// Esse webhook atende mais de um produto Hotmart (mesma URL cadastrada em cada um) —
// cada produto tem seu próprio pixel Meta, por isso o pixel é escolhido pelo product.id.
const META_PIXEL_BY_PRODUCT = {
  '4603825': '1358655868587428', // Visitação Padrão Parque Nacional — PIXEL BERALDO
  '7360360': '791417620220737',  // Calculadora de Índice de Atratividade Turística (IAT) — Pixel IAT
};
const META_PIXEL_DEFAULT = '1358655868587428';

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Dispara o Purchase direto pra API de Conversões da Meta, server-side.
// Substitui tanto o fbq('track','Purchase') do navegador quanto a integração nativa da Hotmart —
// evita duplicar o mesmo evento em duas fontes sem event_id compartilhado.
async function sendMetaPurchase({ token, transaction, buyer, price, pixelId }) {
  if (!token) return;

  const userData = {};
  if (buyer.email) userData.em = [await sha256Hex(buyer.email)];
  const phone = buyer.checkout_phone || buyer.phone;
  if (phone) userData.ph = [await sha256Hex(String(phone).replace(/\D/g, ''))];

  const payload = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: transaction,
      action_source: 'system_generated',
      user_data: userData,
      custom_data: {
        value: price?.value ?? 0,
        currency: price?.currency_value || 'BRL',
      },
    }],
  };

  await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function onRequestPost({ request, env }) {
  const hottok = request.headers.get('x-hotmart-hottok') || '';
  if (hottok !== env.HOTMART_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body;
  try { body = await request.json(); }
  catch { return new Response('Invalid JSON', { status: 400 }); }

  // Só processa compras aprovadas
  if (body.event !== 'PURCHASE_APPROVED') {
    return new Response('OK', { status: 200 });
  }

  const purchase = body.data?.purchase || {};
  const buyer    = body.data?.buyer    || {};

  let variant = purchase.tracking?.source
             || purchase.producer?.trackingParameters?.src
             || '';

  // Se não veio src no webhook, busca o checkout_click mais recente (últimos 30min)
  if (!variant) {
    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const lookup = await fetch(
      `${SUPABASE_URL}/rest/v1/ab_events?event_type=eq.checkout_click&variant=in.(quiz,lp)&created_at=gte.${since}&order=created_at.desc&limit=1`,
      { headers: { 'apikey': env.SUPABASE_KEY, 'Authorization': 'Bearer ' + env.SUPABASE_KEY } }
    );
    const rows = await lookup.json();
    variant = rows?.[0]?.variant || 'unknown';
  }

  const transaction = purchase.transaction || crypto.randomUUID();
  const product     = body.data?.product || {};

  await fetch(`${SUPABASE_URL}/rest/v1/ab_events`, {
    method: 'POST',
    headers: {
      'apikey':        env.SUPABASE_KEY,
      'Authorization': 'Bearer ' + env.SUPABASE_KEY,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify({
      session_id: transaction,
      variant,
      event_type: 'purchase',
      email:      buyer.email || '',
    }),
  });

  // Venda completa (valor, produto) para o dashboard de gestão
  await fetch(`${SUPABASE_URL}/rest/v1/vendas`, {
    method: 'POST',
    headers: {
      'apikey':        env.SUPABASE_KEY,
      'Authorization': 'Bearer ' + env.SUPABASE_KEY,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal,resolution=ignore-duplicates',
    },
    body: JSON.stringify({
      transaction_id:   transaction,
      produto_id:       product.id || '',
      produto_nome:     product.name || '',
      valor:            purchase.price?.value ?? null,
      moeda:            purchase.price?.currency_value || 'BRL',
      variante:         variant,
      comprador_email:  buyer.email || '',
      comprador_nome:   buyer.name || '',
    }),
  });

  const pixelId = META_PIXEL_BY_PRODUCT[String(product.id)] || META_PIXEL_DEFAULT;
  await sendMetaPurchase({
    token: env.META_CAPI_TOKEN,
    transaction,
    buyer,
    price: purchase.price,
    pixelId,
  });

  return new Response('OK', { status: 200 });
}

export async function onRequestGet() {
  return new Response('Webhook ativo', { status: 200 });
}
