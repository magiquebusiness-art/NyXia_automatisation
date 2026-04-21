/* ─────────────────────────────────────────────────────────────
   NyXia Automation — Cloudflare Workers
   Serves static HTML + images from the ./src directory
   ───────────────────────────────────────────────────────────── */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle all requests through KV asset handler
    try {
      return await getAssetFromKV(
        { request, waitUntil: (p) => ctx.waitUntil(p) },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST),
          mapRequestToAsset: (req) => {
            const url = new URL(req.url);

            // Serve index.html for root path
            if (url.pathname === '/') {
              url.pathname = '/index.html';
            }

            // If no extension and not a known static file, serve index.html
            if (!url.pathname.includes('.')) {
              url.pathname = '/index.html';
            }

            return new Request(url.toString(), req);
          },
        }
      );
    } catch (e) {
      // Fallback: return index.html for any unmatched route
      try {
        const indexRequest = new Request(new URL('/index.html', request.url).toString(), request);
        return await getAssetFromKV(
          { request: indexRequest, waitUntil: (p) => ctx.waitUntil(p) },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: JSON.parse(env.__STATIC_CONTENT_MANIFEST),
          }
        );
      } catch (e2) {
        return new Response('Not Found', { status: 404 });
      }
    }
  },
};
