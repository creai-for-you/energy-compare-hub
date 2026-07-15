export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScanner(env))
  },

  async fetch(request, env) {
    const result = await runScanner(env)

    return Response.json(result)
  }
}

async function runScanner(env) {
  const headers = {
    apikey: env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }

  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/configurazione_drive?select=*`,
      {
        method: 'GET',
        headers
      }
    )

    const data = await response.json()

    return {
      success: true,
      responseOk: response.ok,
      status: response.status,
      rows: Array.isArray(data) ? data.length : 0,
      rawData: data
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}