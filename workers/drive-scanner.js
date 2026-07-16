import { SignJWT, importPKCS8 } from "jose";
import { createClient } from "@supabase/supabase-js";

const ROOT_FOLDER_ID = "1TV9_3II1TWws17FD-tV9UurVMUIE-7o4";

export default {
  async fetch(request, env) {
    return Response.json(await runScanner(env));
  }
};

async function runScanner(env) {
  const token = await getAccessToken(env);

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_KEY
  );

  const folders = await getFolders(
    token,
    ROOT_FOLDER_ID
  );

  let totalPdf = 0;
  let insertOk = 0;
  const errors = [];

  for (const folder of folders) {
    const pdfs = await getPdfs(
      token,
      folder.id
    );

    totalPdf += pdfs.length;

    for (const pdf of pdfs) {
      const { error } = await supabase
        .from("repository_drive")
        .upsert(
          {
            google_file_id: pdf.id,
            nome_file: pdf.name,
            ultima_modifica: pdf.modifiedTime,
            url_file: pdf.webViewLink,
            categoria_drive: folder.name,
            ultima_scansione:
              new Date().toISOString()
          },
          {
            onConflict: "google_file_id"
          }
        );

      if (error) {
        errors.push(error.message);
      } else {
        insertOk++;
      }
    }
  }

  return {
    success: true,
    cartelle: folders.length,
    pdf_trovati: totalPdf,
    inseriti: insertOk,
    errori: errors.slice(0, 20)
  };
}

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
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType='application/pdf'+and+trashed=false&fields=files(id,name,modifiedTime,webViewLink)`,
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
