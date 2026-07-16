import { SignJWT, importPKCS8 } from "jose";

export default {
  async fetch(request, env) {
    try {
      const token = await getAccessToken(env);

      return Response.json({
        success: true,
        tokenReceived: true,
        tokenLength: token.length
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: error.message
      });
    }
  }
};

async function getAccessToken(env) {
  const key = await importPKCS8(
    env.GOOGLE_PRIVATE_KEY,
    "RS256"
  );

  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/drive.readonly"
  })
    .setProtectedHeader({
      alg: "RS256",
      typ: "JWT"
    })
    .setIssuer(env.GOOGLE_CLIENT_EMAIL)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  const response = await fetch(
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
        assertion: jwt
      })
    }
  );

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(JSON.stringify(data));
  }

  return data.access_token;
}