// 관리자 전용 방문 통계: ADMIN_KEY(클라우드플레어 비밀 변수)와 맞아야만 숫자를 준다.
const kst = (off = 0) => new Date(Date.now() + 9 * 3600e3 - off * 864e5).toISOString().slice(0, 10);
export async function onRequestGet({ request, env }) {
  const key = request.headers.get('x-admin-key') || '';
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return new Response(JSON.stringify({ ok: false }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  if (!env.VISITS) return new Response(JSON.stringify({ ok: false, reason: 'no-kv' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  const days = [...Array(7)].map((_, i) => kst(i));
  const vals = await Promise.all(days.map(d => env.VISITS.get('d:' + d)));
  const total = parseInt(await env.VISITS.get('total')) || 0;
  return new Response(JSON.stringify({ ok: true, today: parseInt(vals[0]) || 0, total, week: days.map((d, i) => ({ d, c: parseInt(vals[i]) || 0 })) }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
