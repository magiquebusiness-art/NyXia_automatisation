interface Env { NYXIA_KV: KVNamespace; }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { token?: string };
    const { token } = body;
    
    if (!token) {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const tokenData = await context.env.NYXIA_KV.get(`token:${token}`, 'json') as any;
    
    if (!tokenData) {
      return new Response(JSON.stringify({ valid: false }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      valid: true,
      email: tokenData.email,
      name: tokenData.name,
      role: tokenData.role
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ valid: false }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
