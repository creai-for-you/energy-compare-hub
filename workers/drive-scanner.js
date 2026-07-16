import { SignJWT, importPKCS8 } from "jose";

const ROOT_FOLDER_ID = "1TV9_3II1TWws17FD-tV9UurVMUIE-7o4";

export default {
  async fetch(request, env) {
    try {
      const token = await getAccessToken(env);

      const rootFolders = await getFolders(
        token,
        ROOT_FOLDER_ID
      );

      const result = [];

      for (const folder of rootFolders) {
        try {
          const pdfs = await getPdfs(
            token,
            folder.id
          );

          result.push({
            cartella: folder.name,
            pdf: pdfs.length
          });
        } catch (err) {
          result.push({
            cartella: folder.name,
            errore: err.message
          });
        }
      }

      return Response.json({
        success: true,
        result
      });

    } catch (error) {
      return Response.json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  }
};

async function getFolders(token, parentId) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  return (
    data.files?.filter(
      f =>
        f.mimeType ===
        "application/vnd.google-apps.folder"
    ) || []
  );
}

async function getPdfs(token, folderId) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'+and+trashed=false&fields=files(id,name)`
    ,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  return data.files || [];
}

async function getAccessToken(env) {
  const key = await importPKCS8(
    env.GOOGLE_PRIVATE_KEY,
    "RS256"
  );

  const jwt = await new SignJWT({
    scope:
      "https://www.googleapis.com/auth/drive.readonly"
  })
    .setProtectedHeader({
      alg: "RS256",
      typ: "JWT"
    })
    .setIssuer(env.GOOGLE_CLIENT_EMAIL)
    .setAudience(
      "https://oauth2.googleapis.com/token"
    )
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

  return data.access_token;
}