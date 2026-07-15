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
  try {
    const token = await getAccessToken(env)

    const rootFolderId =
      "1TV9_3II1TWws17FD-tV9UurVMUIE-7o4"

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${rootFolderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,modifiedTime,webViewLink)`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    return {
      success: true,
      folderId: rootFolderId,
      filesFound: data.files?.length || 0,
      files: data.files || []
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000)

  const header = {
    alg: "RS256",
    typ: "JWT"
  }

  const payload = {
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  }

  const jwt =
    `${base64url(JSON.stringify(header))}.` +
    `${base64url(JSON.stringify(payload))}`

  const privateKey = env.GOOGLE_PRIVATE_KEY
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "")

  const keyData = Uint8Array.from(
    atob(privateKey),
    c => c.charCodeAt(0)
  )

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(jwt)
  )

  const signedJwt =
    `${jwt}.${base64url(signature)}`

  const tokenResponse = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type:
          "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: signedJwt
      })
    }
  )

  const tokenData =
    await tokenResponse.json()

  if (!tokenData.access_token) {
    throw new Error(
      JSON.stringify(tokenData)
    )
  }

  return tokenData.access_token
}

function base64url(input) {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input)

  let binary = ""

  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}