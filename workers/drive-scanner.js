export default {
  async fetch(request, env) {
    const headers = {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Profile': 'public'
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

      return Response.json({
        success: response.ok,
        status: response.status,
        data
      })
    } catch (error) {
      return Response.json({
        success: false,
        error: error.message
      })
    }
  }
}