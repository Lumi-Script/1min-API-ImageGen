export default {
  async fetch(request: Request, env: any, ctx: any) {
    const url = new URL(request.url);

    // Intercept requests to /api/images
    if (url.pathname.startsWith('/api/images')) {
      const targetUrl = url.searchParams.get('url');

      if (!targetUrl) {
        return new Response('Missing "url" query parameter', { status: 400 });
      }

      try {
        // Fetch the actual image from the external server
        const imageResponse = await fetch(targetUrl, {
          method: 'GET',
          // Optionally pass along headers, though often not needed for simple images
        });

        // Reconstruct the response and append permissive CORS headers
        const newResponse = new Response(imageResponse.body, imageResponse);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', '*');
        
        return newResponse;
      } catch (err: any) {
        return new Response(`Error fetching image: ${err.message}`, { status: 500 });
      }
    }

    // For all other requests, serve the Cloudflare Pages frontend assets
    return env.ASSETS.fetch(request);
  },
};
