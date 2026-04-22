interface Env {
  NYXIA_KV: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { email?: string; password?: string; name?: string };
    const { email, password, name } = body;
    
    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Email et mot de passe requis' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userKey = `user:${email.toLowerCase().trim()}`;
    const existingUser = await context.env.NYXIA_KV.get(userKey, 'json') as any;
    
    if (existingUser) {
      // Login
      if (existingUser.password !== password) {
        return new Response(JSON.stringify({ success: false, error: 'Identifiants incorrects' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (existingUser.status === 'suspended') {
        return new Response(JSON.stringify({ success: false, error: 'Compte suspendu' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const token = btoa(`${email}:${Date.now()}:${Math.random().toString(36).slice(2)}`);
      await context.env.NYXIA_KV.put(`token:${token}`, JSON.stringify({
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role || 'client',
        createdAt: Date.now()
      }), { expirationTtl: 86400 * 7 }); // 7 days
      
      return new Response(JSON.stringify({
        success: true,
        token,
        firstname: (existingUser.name || '').split(' ')[0],
        role: existingUser.role || 'client'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Auto-register if no existing user
    const isAdmin = email.toLowerCase().trim() === 'dianeboyer@publication-web.com';
    const newUser = {
      email: email.toLowerCase().trim(),
      password,
      name: name || email.split('@')[0],
      role: isAdmin ? 'superadmin' : 'client',
      products: isAdmin ? ['automation', 'flipbook'] : ['automation'],
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    await context.env.NYXIA_KV.put(userKey, JSON.stringify(newUser));
    
    const token = btoa(`${email}:${Date.now()}:${Math.random().toString(36).slice(2)}`);
    await context.env.NYXIA_KV.put(`token:${token}`, JSON.stringify({
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: Date.now()
    }), { expirationTtl: 86400 * 7 });
    
    return new Response(JSON.stringify({
      success: true,
      token,
      firstname: (newUser.name || '').split(' ')[0],
      role: newUser.role
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
