// 방문 기록: 한 사람(브라우저)은 하루에 한 번만 센다. 관리자 기기는 세지 않는다.
const kstDate = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
export async function onRequestPost({ request, env }) {
  if (!env.VISITS) return new Response('no-kv', { status: 200 });
  if (request.headers.get('x-admin') === '1') return new Response('admin', { status: 200 });
  const today = kstDate();
  const cookie = request.headers.get('Cookie') || '';
  if (cookie.includes('bds_v=' + today)) return new Response('seen', { status: 200 });
  const dKey = 'd:' + today;
  const [d, t] = await Promise.all([env.VISITS.get(dKey), env.VISITS.get('total')]);
  await Promise.all([
    env.VISITS.put(dKey, String((parseInt(d) || 0) + 1), { expirationTtl: 60 * 60 * 24 * 400 }),
    env.VISITS.put('total', String((parseInt(t) || 0) + 1)),
  ]);
  return new Response('ok', { status: 200, headers: { 'Set-Cookie': `bds_v=${today}; Path=/; Max-Age=172800; SameSite=Lax; Secure` } });
}
