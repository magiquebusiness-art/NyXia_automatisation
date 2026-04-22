interface Env { NYXIA_KV: KVNamespace; }

async function verifyAdmin(kv: KVNamespace, authHeader: string): Promise<any> {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const tokenData = await kv.get(`token:${token}`, 'json') as any;
  if (!tokenData) return null;
  const isSuperAdmin = tokenData.role === 'superadmin' || tokenData.role === 'admin' || tokenData.email === 'dianeboyer@publication-web.com';
  return isSuperAdmin ? tokenData : null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const authHeader = context.request.headers.get('Authorization') || '';
    const admin = await verifyAdmin(context.env.NYXIA_KV, authHeader);
    
    if (!admin) {
      return new Response(JSON.stringify({ success: false, error: 'Non autorisé' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    const list = await context.env.NYXIA_KV.list({ prefix: 'user:' });
    let automation = 0, flipbook = 0, active = 0, total = list.keys.length;
    
    for (const key of list.keys) {
      const user = await context.env.NYXIA_KV.get(key.name, 'json') as any;
      if (user) {
        const products = user.products || (user.plan ? [user.plan] : []);
        if (products.includes('automation') || products.includes('pro')) automation++;
        if (products.includes('flipbook')) flipbook++;
        if (user.status !== 'suspended') active++;
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      stats: { automation, flipbook, active, accounts: total, sites: automation, pro: automation, publications: automation * 12 }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
