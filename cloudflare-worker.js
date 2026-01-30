/**
 * Cloudflare Worker 代理（推荐用于 GitHub Pages）
 * 1) Workers 新建服务，粘贴此代码
 * 2) Settings -> Variables 添加 Secret: DEEPSEEK_API_KEY
 * 3) 前端 CONFIG:
 *    url: "https://<your-worker>.workers.dev/translate"
 *    authMode: "proxy"
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!url.pathname.endsWith("/translate")) {
      return new Response("Not Found", { status: 404 });
    }

    const { payload } = await request.json();
    const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
