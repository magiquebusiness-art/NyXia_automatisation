export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;

    // Route mapping
    const routes = {
      '/': '/index.html',
      '/login': '/login.html',
      '/dashboard': '/dashboard.html',
      '/dashboard/nouvelle-publication': '/nouvelle-publication.html',
      '/dashboard/mes-publications': '/mes-publications.html',
      '/dashboard/mes-comptes': '/mes-comptes.html',
      '/dashboard/parametres': '/parametres.html',
      '/super-admin': '/super-admin.html',
    };

    // Check if it's a route
    if (routes[path]) {
      path = routes[path];
    }

    // If no extension, try .html
    if (!path.includes('.')) {
      path = path + '.html';
    }

    try {
      const object = await env.__STATIC_CONTENT.get(path.slice(1));
      if (!object) {
        return new Response('Not Found', { status: 404 });
      }

      // Determine content type
      const ext = path.split('.').pop().toLowerCase();
      const contentTypes = {
        'html': 'text/html;charset=UTF-8',
        'css': 'text/css;charset=UTF-8',
        'js': 'application/javascript;charset=UTF-8',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'ico': 'image/x-icon',
        'webp': 'image/webp',
        'json': 'application/json',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
        'ttf': 'font/ttf',
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';

      return new Response(object, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': ext === 'html' ? 'no-cache' : 'public, max-age=31536000',
        },
      });
    } catch (e) {
      return new Response('Not Found', { status: 404 });
    }
  },
};
