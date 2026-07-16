import { SignJWT, importPKCS8 } from "jose";
import { createClient } from "@supabase/supabase-js";

const ROOT_FOLDER_ID = "1TV9_3II1TWws17FD-tV9UurVMUIE-7o4";

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScanner(env));
  },

  async fetch(request, env) {
    return Response.json(await runScanner(env));
  }
};

async function runScanner(env) {
  try {
    const token = await getAccessToken(env);

    const supabase = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY
    );

    const allPdfs = [];

    await scanRecursive(
      token,
      ROOT_FOLDER_ID,
      "",
      allPdfs,
      new Set()
    );

    let inseriti = 0;

    for (const pdf of allPdfs) {
      const { error } = await supabase
        .from("repository_drive")
        .upsert(
          {
            google_file_id: pdf.id,
            nome_file: pdf.name,
            ultima_modifica: pdf.modifiedTime,
            url_file: pdf.webViewLink,
            categoria_drive: pdf.rootCategory,
            ultima_scansione: new Date().toISOString()
          },
          {
            onConflict: "google_file_id"
          }
        );

      if (!error) {
        inseriti++;
      }
    }

    const distribuzione = {};

    for (const pdf of allPdfs) {
      distribuzione[pdf.rootCategory] =
        (distribuzione[pdf.rootCategory] || 0) + 1;
    }

    return {
      success: true,
      pdf_trovati: allPdfs.length,
      inseriti,
      distribuzione
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

async function scanRecursive(
  token,
  folderId,
  rootCategory,
  results,
  visited
) {
  if (visited.has(folderId)) {
    return;
  }

  visited.add(folderId);

  const children = await listFolder(
    token,
    folderId
  );

  for (const item of children) {

    if (
      item.mimeType ===
      "application/vnd.google-apps.folder"
    ) {
      await scanRecursive(
        token,
        item.id,
        rootCategory || item.name,
        results,
        visited
      );
    }

    if (
      item.mimeType ===
      "application/pdf"
    ) {
      results.push({
        ...item,
        rootCategory
      });
    }
  }
}

async function listFolder(
  token,
  folderId
) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,modifiedTime,webViewLink)`,
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
    .setIssuer(
      env.GOOGLE_CLIENT_EMAIL
    )
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

  if (!data.access_token) {
    throw new Error(
      JSON.stringify(data)
    );
  }

  return data.access_token;
}