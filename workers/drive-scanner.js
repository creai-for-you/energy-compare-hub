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

    const config =
      await configResponse.json()

    if (!config.length) {
      return {
        success: false,
        message:
          'Configurazione Drive non trovata'
      }
    }

    const driveConfig = config[0]

    console.log(
      'Cartella Drive:',
      driveConfig.cartella_principale
    )

    // QUI IN FUTURO LEGGEREMO GOOGLE DRIVE

    const mockFiles = [
      {
        nome_file:
          '45935_SEGNOVERDE_DOM_PSV_OFFERTA_SECONDA_CASA_GAS_GAS_626_Q22026.pdf',
        codice_listino: '45935',
        categoria_cliente: 'DOMESTICO'
      },
      {
        nome_file:
          '45951_SEGNOVERDE_DOM_PSV_AGILE_FLEX_GAS_626_Q22026.pdf',
        codice_listino: '45951',
        categoria_cliente: 'DOMESTICO'
      },
      {
        nome_file:
          '45952_SEGNOVERDE_DOM_PSV_AGILE_PREMIUM_GAS_626_Q22026.pdf',
        codice_listino: '45952',
        categoria_cliente: 'DOMESTICO'
      }
    ]

    for (const file of mockFiles) {
      const checkResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/repository_drive?codice_listino=eq.${file.codice_listino}&select=*`,
        {
          headers
        }
      )

      const existing =
        await checkResponse.json()

      if (existing.length === 0) {
        // INSERT repository_drive

        await fetch(
          `${SUPABASE_URL}/rest/v1/repository_drive`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              nome_file: file.nome_file,
              codice_listino:
                file.codice_listino,
              categoria_cliente:
                file.categoria_cliente,
              stato_offerta:
                'ATTIVA',
              giorni_tolleranza: 15,
              stato: 'NUOVO'
            })
          }
        )

        // INSERT file_monitorati

        await fetch(
          `${SUPABASE_URL}/rest/v1/file_monitorati`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              nome_file: file.nome_file,
              stato: 'NUOVO'
            })
          }
        )

        console.log(
          'Inserito:',
          file.nome_file
        )
      }
    }

    return {
      success: true,
      message:
        'Scanner completato',
      filesFound:
        mockFiles.length
    }
  } catch (error) {
    console.error(error)

    return {
      success: false,
      error: error.message
    }
  }
}