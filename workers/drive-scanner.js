export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScanner(env))
  },

  async fetch(request, env) {
    return new Response(
      JSON.stringify(
        {
          SUPABASE_URL: env.SUPABASE_URL || null,
          HAS_SERVICE_KEY: !!env.SUPABASE_SERVICE_KEY
        },
        null,
        2
      ),
      {
        headers: {
          "content-type": "application/json"
        }
      }
    )
  }
}