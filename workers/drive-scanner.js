import { SignJWT, importPKCS8 } from "jose";
import { createClient } from "@supabase/supabase-js";

const ROOT_FOLDER_ID =
  "1TV9_3II1TWws17FD-tV9UurVMUIE-7o4";

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScanner(env));
  },

  async fetch(request, env) {
    return Response.json(
      await runScanner(env)
    );
  }
};

async function runScanner(env) {
  try {
    const token =
      await getAccessToken(env);

    const supabase =
      createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_KEY
      );

    const allPdfs = [];

    await scanRecursive(
      token,
      ROOT_FOLDER_ID,
      "",
      "",
      allPdfs,
      new Set()
    );

    let inseriti = 0;
    let errori = 0;

    for (const pdf of allPdfs) {
      const metadata =
        parseFileName(pdf.name);

      // Log per file non riconosciuti
      if (
        !metadata.codice_listino
      ) {
        console.log(
          "FILE NON RICONOSCIUTO:",
          pdf.name
        );
      }

      const { error } =
        await supabase
          .from("repository_drive")
          .upsert(
            {
              google_file_id: pdf.id,

              nome_file: pdf.name,

              ultima_modifica:
                pdf.modifiedTime,

              url_file:
                pdf.webViewLink,

              categoria_drive:
                pdf.rootCategory,

              percorso_drive:
                pdf.path,

              ultima_scansione:
                new Date().toISOString(),

              codice_listino:
                metadata.codice_listino,

              fornitore:
                metadata.fornitore,

              categoria_cliente:
                metadata.categoria_cliente,

              formula:
                metadata.formula,

              commodity:
                metadata.commodity,

              prodotto:
                metadata.prodotto,

              versione:
                metadata.versione,

              periodo:
                metadata.periodo,

              stato_offerta:
                "ATTIVA",

              ultimo_import:
                new Date().toISOString()
            },
            {
              onConflict:
                "google_file_id"
            }
          );

      if (error) {
        errori++;

        console.error(
          "ERRORE UPSERT:",
          pdf.name,
          error
        );

        continue;
      }

      inseriti++;
    }

    const distribuzione = {};

    for (const pdf of allPdfs) {
      distribuzione[
        pdf.rootCategory
      ] =
        (
          distribuzione[
            pdf.rootCategory
          ] || 0
        ) + 1;
    }

    return {
      success: true,
      pdf_trovati:
        allPdfs.length,
      inseriti,
      errori,
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
  currentPath,
  results,
  visited
) {
  if (
    visited.has(folderId)
  ) {
    return;
  }

  visited.add(folderId);

  const children =
    await listFolder(
      token,
      folderId
    );

  for (const item of children) {
    if (
      item.mimeType ===
      "application/vnd.google-apps.folder"
    ) {
      const nextRoot =
        rootCategory ||
        item.name;

      const nextPath =
        currentPath
          ? `${currentPath}/${item.name}`
          : item.name;

      await scanRecursive(
        token,
        item.id,
        nextRoot,
        nextPath,
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
        rootCategory,
        path: currentPath
      });
    }
  }
}

async function listFolder(
  token,
  folderId
) {
  const response =
    await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,modifiedTime,webViewLink)`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await response.json();

  return data.files || [];
}

/**
 * Parser robusto.
 * Non dipende da nomi offerta fissi.
 * Continua a funzionare anche se Segnoverde
 * inventa nuovi prodotti.
 */
function parseFileName(
  nomeFile
) {
  const clean =
    nomeFile
      .replace(
        /\.pdf$/i,
        ""
      )
      .trim();

  const parts =
    clean
      .split("_")
      .map(p =>
        p.trim()
      )
      .filter(Boolean);

  const result = {
    codice_listino:
      null,

    fornitore:
      null,

    categoria_cliente:
      null,

    formula:
      null,

    commodity:
      null,

    prodotto:
      null,

    versione:
      null,

    periodo:
      null
  };

  // codice listino
  const codice =
    parts.find(
      p =>
        /^\d{5}$/.test(
          p
        )
    );

  if (codice) {
    result.codice_listino =
      Number(codice);
  }

  // fornitore
  if (parts.length > 1) {
    result.fornitore =
      parts[1];
  }

  // cliente
  if (
    parts.includes(
      "DOM"
    ) ||
    parts.includes(
      "DOMESTICO"
    )
  ) {
    result.categoria_cliente =
      "DOM";
  }

  if (
    parts.includes(
      "BUS"
    ) ||
    parts.includes(
      "BUSINESS"
    )
  ) {
    result.categoria_cliente =
      "BUS";
  }

  // formula
  const formuleNote =
    [
      "FIX",
      "PSV",
      "PUN",
      "PLACET",
      "INDEX"
    ];

  const formula =
    parts.find(
      p =>
        formuleNote.includes(
          p.toUpperCase()
        )
    );

  if (formula) {
    result.formula =
      formula.toUpperCase();
  }

  // commodity
  if (
    parts.includes(
      "GAS"
    )
  ) {
    result.commodity =
      "GAS";
  }

  if (
    parts.includes(
      "EE"
    ) ||
    parts.includes(
      "LUCE"
    )
  ) {
    result.commodity =
      "EE";
  }

  // versione (726 ecc)
  const versione =
    parts.find(
      p =>
        /^\d{3}$/.test(
          p
        )
    );

  if (versione) {
    result.versione =
      versione;
  }

  // periodo (Q32026)
  const periodo =
    parts.find(
      p =>
        /^Q\d\d{4}$/i.test(
          p
        )
    );

  if (periodo) {
    result.periodo =
      periodo.toUpperCase();
  }

  // COSTRUZIONE NOME OFFERTA

const esclusi =
  new Set([
    String(
      result.codice_listino
    ),

    result.fornitore,

    result.commodity,

    result.versione,

    result.periodo,

    "TRIO",

    "MONO"
  ]);

const prodottoParts =
  parts.filter(
    p =>
      p &&
      !esclusi.has(p)
  );

let nomeProdotto =
  prodottoParts
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

// Rimuove eventuali prefissi duplicati
nomeProdotto =
  nomeProdotto
    .replace(/^DOM\s+/i, "")
    .replace(/^BUS\s+/i, "")
    .replace(/^CON\s+/i, "")
    .replace(/^FIX\s+/i, "")
    .replace(/^PSV\s+/i, "")
    .replace(/^PUN\s+/i, "")
    .trim();

result.prodotto =
  [
    result.categoria_cliente,
    result.formula,
    nomeProdotto
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

return result;
}

async function getAccessToken(
  env
) {
  const key =
    await importPKCS8(
      env.GOOGLE_PRIVATE_KEY,
      "RS256"
    );

  const jwt =
    await new SignJWT({
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
      .setExpirationTime(
        "1h"
      )
      .sign(key);

  const response =
    await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body:
          new URLSearchParams(
            {
              grant_type:
                "urn:ietf:params:oauth:grant-type:jwt-bearer",

              assertion:
                jwt
            }
          )
      }
    );

  const data =
    await response.json();

  if (
    !data.access_token
  ) {
    throw new Error(
      JSON.stringify(
        data
      )
    );
  }

  return data.access_token;
}