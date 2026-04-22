interface Env { NYXIA_KV: KVNamespace; }

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { token?: string };
    const { token } = body;
    
    if (token) {
      await context.env.NYXIA_KV.delete(`token:${token}`);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
