export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScanner(env))
  },

  async fetch(request, env) {
    const result = await runScanner(env)

    return new Response(
      JSON.stringify(result, null, 2),
      {
        headers: {
          'content-type': 'application/json'
        }
      }
    )
  }
}

async function runScanner(env) {
  const SUPABASE_URL = env.SUPABASE_URL
  const SUPABASE_SERVICE_KEY =
    env.SUPABASE_SERVICE_KEY

  const headers = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json'
  }

  try {
    // CONFIGURAZIONE DRIVE

    const configResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/configurazione_drive?select=*`,
      {
        headers
      }
    )

    const configurazione =
      await configResponse.json()

    // REPOSITORY DRIVE

    const repositoryResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/repository_drive?select=*`,
      {
        headers
      }
    )

    const repository =
      await repositoryResponse.json()

    // FILE MONITORATI

    const monitorResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/file_monitorati?select=*`,
      {
        headers
      }
    )

    const monitorati =
      await monitorResponse.json()

    // CATEGORIE

    const categorieResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/categorie_offerte?select=*`,
      {
        headers
      }
    )

    const categorie =
      await categorieResponse.json()

    return {
      success: true,
      timestamp: new Date().toISOString(),

      database: {
        configurazione_drive:
          configurazione.length,

        repository_drive:
          repository.length,

        file_monitorati:
          monitorati.length,

        categorie_offerte:
          categorie.length
      },

      drive: {
        url:
          configurazione?.[0]
            ?.cartella_principale || null,

        scansione:
          configurazione?.[0]
            ?.frequenza_scansione || null
      },

      stato: 'Scanner operativo'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}