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
    
    const body = await context.request.json() as {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
      products?: string[];
      status?: string;
    };
    
    const { email, password, name, role, products, status } = body;
    
    if (!email) {
      return new Response(JSON.stringify({ success: false, error: 'Email requis' }), {
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
    
    const updatedUser = {
      ...existingUser,
      email: email.toLowerCase().trim(),
      ...(password ? { password } : {}),
      ...(name ? { name } : {}),
      ...(role ? { role } : {}),
      ...(products ? { products } : {}),
      ...(status ? { status } : {}),
      updatedAt: new Date().toISOString()
    };
    
    await context.env.NYXIA_KV.put(userKey, JSON.stringify(updatedUser));
    
    // If status changed to suspended, invalidate all tokens for this user
    if (status === 'suspended') {
      // Note: In production, you'd want to track and delete all tokens for this user
      // For now, tokens will expire naturally via TTL
    }
    
    return new Response(JSON.stringify({
      success: true,
      account: {
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        products: updatedUser.products,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
