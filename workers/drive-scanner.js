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
  return {
    success: true,
    messaggio:
      "Google Drive API configurata correttamente",

    email: env.GOOGLE_CLIENT_EMAIL,

    keyPresent: !!env.GOOGLE_PRIVATE_KEY,

    prossima_fase:
      "abilitazione scansione reale Drive"
  }
}