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
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Profile": "public"
  }

  try {
    const [
      configurazioneRes,
      repositoryRes,
      monitoratiRes,
      categorieRes,
      mappaturaRes
    ] = await Promise.all([
      fetch(
        `${env.SUPABASE_URL}/rest/v1/configurazione_drive?select=*`,
        { headers }
      ),
      fetch(
        `${env.SUPABASE_URL}/rest/v1/repository_drive?select=*`,
        { headers }
      ),
      fetch(
        `${env.SUPABASE_URL}/rest/v1/file_monitorati?select=*`,
        { headers }
      ),
      fetch(
        `${env.SUPABASE_URL}/rest/v1/categorie_offerte?select=*`,
        { headers }
      ),
      fetch(
        `${env.SUPABASE_URL}/rest/v1/mappatura_cartelle_drive?select=*`,
        { headers }
      )
    ])

    const configurazione =
      await configurazioneRes.json()

    const repository =
      await repositoryRes.json()

    const monitorati =
      await monitoratiRes.json()

    const categorie =
      await categorieRes.json()

    const mappatura =
      await mappaturaRes.json()

    const now = new Date().toISOString()

    return {
      success: true,

      timestamp: now,

      drive: {
        url:
          configurazione?.[0]
            ?.cartella_principale || null,

        attiva:
          configurazione?.[0]
            ?.attiva || false,

        frequenza:
          configurazione?.[0]
            ?.frequenza_scansione || null
      },

      statistiche: {
        repository_drive:
          repository.length,

        file_monitorati:
          monitorati.length,

        categorie_offerte:
          categorie.length,

        mappatura_cartelle_drive:
          mappatura.length
      },

      categorie: categorie.map(
        c => c.categoria
      ),

      mappature: mappatura.map(
        m => ({
          cartella: m.cartella_drive,
          categoria:
            m.categoria_offerta
        })
      ),

      prossima_fase:
        "scanGoogleDrive",

      stato:
        "Scanner V4 operativo"
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}