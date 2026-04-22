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
    
    const { email, password, name, role = 'client', products = ['automation'], status = 'active' } = body;
    
    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email et mot de passe requis' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userKey = `user:${email.toLowerCase().trim()}`;
    const existingUser = await context.env.NYXIA_KV.get(userKey, 'json') as any;
    
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: 'Un compte avec cet email existe déjà' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const newUser = {
      email: email.toLowerCase().trim(),
      password,
      name: name || email.split('@')[0],
      role,
      products,
      status,
      createdAt: new Date().toISOString()
    };
    
    await context.env.NYXIA_KV.put(userKey, JSON.stringify(newUser));
    
    return new Response(JSON.stringify({
      success: true,
      account: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        products: newUser.products,
        status: newUser.status,
        createdAt: newUser.createdAt
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
