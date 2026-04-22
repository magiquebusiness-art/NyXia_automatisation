interface Env { NYXIA_KV: KVNamespace; }

async function verifyAdmin(kv: KVNamespace, authHeader: string): Promise<any> {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const tokenData = await kv.get(`token:${token}`, 'json') as any;
  if (!tokenData) return null;
  const isSuperAdmin = tokenData.role === 'superadmin' || tokenData.role === 'admin' || tokenData.email === 'dianeboyer@publication-web.com';
  return isSuperAdmin ? tokenData : null;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const authHeader = context.request.headers.get('Authorization') || '';
    const admin = await verifyAdmin(context.env.NYXIA_KV, authHeader);
    
    if (!admin) {
      return new Response(JSON.stringify({ success: false, error: 'Non autorisé' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    const body = await context.request.json() as { email?: string };
    const { email } = body;
    
    if (!email) {
      return new Response(JSON.stringify({ success: false, error: 'Email requis' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Prevent deleting the superadmin account
    if (email.toLowerCase().trim() === 'dianeboyer@publication-web.com') {
      return new Response(JSON.stringify({ success: false, error: 'Impossible de supprimer le compte superadmin' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userKey = `user:${email.toLowerCase().trim()}`;
    const existingUser = await context.env.NYXIA_KV.get(userKey, 'json') as any;
    
    if (!existingUser) {
      return new Response(JSON.stringify({ success: false, error: 'Compte introuvable' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await context.env.NYXIA_KV.delete(userKey);
    
    // Note: Active tokens for this user will expire naturally via TTL
    
    return new Response(JSON.stringify({
      success: true,
      deleted: email.toLowerCase().trim()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
