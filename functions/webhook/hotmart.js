const SUPABASE_URL = 'https://sdjlnjqtgnodnifkbykq.supabase.co';

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

  return new Response('OK', { status: 200 });
}

export async function onRequestGet() {
  return new Response('Webhook ativo', { status: 200 });
}
