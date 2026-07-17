import crypto from "crypto";
import { supabase } from "../src/lib/supabase.js";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { SignJWT, importPKCS8 } from "jose";

const GOOGLE_CLIENT_EMAIL =
  "cloudflare-drive-scanner@energy-compare-hub.iam.gserviceaccount.com";

function extract(text, regex) {
  return text.match(regex)?.[1]?.trim() || null;
}

async function getAccessToken() {
  const privateKey = fs.readFileSync(
    "./private-key.pem",
    "utf8"
  );

  const key = await importPKCS8(
    privateKey,
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
      GOOGLE_CLIENT_EMAIL
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

  return await response.json();
}

async function parsePdf() {
  const {
    data: repository,
    error: repositoryError
  } = await supabase
    .from("repository_drive")
    .select("*");

  if (repositoryError) {
    console.error(repositoryError);
    return;
  }

  console.log(
    `\nPDF TROVATI: ${repository.length}`
  );

  const token = await getAccessToken();

  let success = 0;
  let failed = 0;

  for (const record of repository) {
    try {
      console.log(
        "\n=============================="
      );

      console.log(
        `PROCESSO: ${record.nome_file}`
      );

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${record.google_file_id}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          `Download error ${response.status}`
        );
      }

      const arrayBuffer =
        await response.arrayBuffer();

      const pdfBuffer =
        Buffer.from(arrayBuffer);

      const hashFile = crypto
        .createHash("sha256")
        .update(pdfBuffer)
        .digest("hex");

      const parser = new PDFParse({
        data: pdfBuffer
      });

      const result =
        await parser.getText();

      const text =
        result.text;
        
      const codiceListino = extract(
        text,
        /CODICE LISTINO:\s*(\d+)/i
      );

      const codiceOfferta = extract(
        text,
        /CODICE OFFERTA:\s*([A-Z0-9]+)/i
      );

      const prodotto = extract(
        text,
        /Prodotto Partner:\s*([^.\n]+)/i
      );

      const quotaFissa = extract(
        text,
        /Corrispettivo Annuo\s*([\d.,]+)\s*€\/(?:POD|PDR)\/Anno/i
      );
      
        const prezzoFissoGas = extract(
        text,
        /Corrispettivo per il consumo\s*([\d.,]+)\s*€\/Smc/i
        );

        const prezzoFissoEE = extract(
     text,
     /Corrispettivo per il consumo\s*([\d.,]+)\s*€\/kWh/i
    );
      const spreadPUN = extract(
        text,
        /PUN\s*\+\s*([\d.,]+)\s*€\/kWh/i
      );

      const spreadPSV = extract(
        text,
        /PSV\s*\+\s*([\d.,]+)\s*€\/Smc/i
      );

      const tipoPrezzo =
    record.nome_file.includes("_FIX_")
    ? "FISSO"
    : "VARIABILE";

      const indice =
        record.commodity === "EE"
          ? "PUN"
          : record.commodity === "GAS"
          ? "PSV"
          : null;

      const offerta = {
        nome_file:
          record.nome_file,

        hash_file:
          hashFile,

        codice_listino:
          codiceListino,

        codice_offerta:
          codiceOfferta,

        nome_offerta:
          prodotto,

        commodity:
          record.commodity,

        tipologia_cliente:
          record.categoria_cliente,

        mercato:
          "LIBERO",

        tipo_prezzo:
          tipoPrezzo,

        indice_riferimento:
          indice,

        prezzo_fisso:
        tipoPrezzo === "FISSO"
        ? Number(
        (
          prezzoFissoGas ||
          prezzoFissoEE
        )?.replace(",", ".")
        )
        : null,

        spread:
          spreadPUN
            ? Number(
                spreadPUN.replace(",", ".")
              )
            : spreadPSV
            ? Number(
                spreadPSV.replace(",", ".")
              )
            : null,

        cap_valore: null,

        quota_fissa_annua:
          quotaFissa
            ? Number(
                quotaFissa.replace(",", ".")
              )
            : null,

        sconto_annuo: null,
        sconto_sdd: null,
        sconto_mail: null,

        spread_rinnovo: null,
        rinnovo_mesi: null,

        validita_dal: null,
        validita_al: null,

        data_import:
          new Date(),

        ultima_verifica:
          new Date(),

        stato: "ATTIVA",

        file_id_drive:
          record.google_file_id,

        metadata: {
        codiceListino,
        codiceOfferta,
        prodotto,
        quotaFissa,
        spreadPUN,
        spreadPSV,
        prezzoFissoGas,
        prezzoFissoEE
        }
      };

      const { error } =
        await supabase
          .from("offerte_pdf")
          .upsert(
            offerta,
            {
              onConflict:
                "hash_file"
            }
          );

      if (error) {
        throw error;
      }

      console.log(
        "✅ IMPORTATO"
      );

      success++;

    } catch (err) {
      console.error(
        "❌ ERRORE"
      );

      console.error(
        record.nome_file
      );

      console.error(
        err.message
      );

      failed++;
    }
  }

  console.log(
    "\n=============================="
  );

  console.log(
    `IMPORTATI: ${success}`
  );

  console.log(
    `ERRORI: ${failed}`
  );
}

parsePdf().catch((err) => {
  console.error(
    "\nERRORE COMPLETO:"
  );

  console.error(err);

  console.error(
    err?.stack
  );
});