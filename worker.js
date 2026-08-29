const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

function allowedHost(host) {
  host = String(host || '').toLowerCase();
  return host === 'fazenda.pr.gov.br' || host.endsWith('.fazenda.pr.gov.br');
}

function response(body, status = 200, type = 'text/plain; charset=utf-8') {
  return new Response(body, { status, headers: { ...CORS, 'Content-Type': type, 'Cache-Control': 'no-store' } });
}

async function fetchPrNfce(target) {
  let current = new URL(target);
  if (current.protocol !== 'https:' && current.protocol !== 'http:') throw new Error('Protocolo inválido');
  if (!allowedHost(current.hostname)) throw new Error('Domínio não permitido');
  if (current.protocol === 'http:') current.protocol = 'https:';

  for (let i = 0; i < 5; i++) {
    const r = await fetch(current.toString(), {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'User-Agent': 'Carrinho-Scanner-V9/1.0'
      }
    });

    if ([301, 302, 303, 307, 308].includes(r.status)) {
      const loc = r.headers.get('Location');
      if (!loc) throw new Error('Redirecionamento inválido');
      const next = new URL(loc, current);
      if (!allowedHost(next.hostname)) throw new Error('Redirecionamento para domínio não permitido');
      if (next.protocol === 'http:') next.protocol = 'https:';
      current = next;
      continue;
    }

    if (!r.ok) throw new Error('SEFA/PR retornou HTTP ' + r.status);
    const html = await r.text();
    if (html.length > 2_500_000) throw new Error('Resposta muito grande');
    return html;
  }
  throw new Error('Muitos redirecionamentos');
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method !== 'GET') return response('Método não permitido', 405);

    const req = new URL(request.url);
    if (req.pathname !== '/' && req.pathname !== '/nfce') return response('Not found', 404);
    const target = req.searchParams.get('url');
    if (!target) return response('Informe ?url=', 400);
    if (target.length > 4000) return response('URL muito longa', 400);

    try {
      const html = await fetchPrNfce(target);
      return response(html, 200, 'text/html; charset=utf-8');
    } catch (e) {
      return response('Falha ao carregar NFC-e: ' + (e && e.message ? e.message : 'erro'), 502);
    }
  }
};
