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
    const accounts = [];
    
    for (const key of list.keys) {
      const user = await context.env.NYXIA_KV.get(key.name, 'json') as any;
      if (user) {
        accounts.push({
          email: user.email,
          name: user.name,
          password: user.password,
          products: user.products || (user.plan ? [user.plan] : []),
          status: user.status || 'active',
          createdAt: user.createdAt,
          plan: user.plan || (user.products ? user.products[0] : 'automation')
        });
      }
    }
    
    return new Response(JSON.stringify({ success: true, accounts }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
