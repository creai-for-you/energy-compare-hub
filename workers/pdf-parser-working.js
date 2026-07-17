import crypto from "crypto";
import { supabase } from "../src/lib/supabase.js";
import fs from "fs";
import { PDFParse } from "pdf-parse";

function extract(text, regex) {
  return text.match(regex)?.[1]?.trim() || null;
}

async function parsePdf() {

      const { data: repository, error: repositoryError } =
    await supabase
      .from("repository_drive")
      .select("*")
      .limit(1);

  console.log("REPOSITORY");
  console.log(repository);

  if (repositoryError) {
    console.error(repositoryError);
    return;
  }

  return;
  const buffer = fs.readFileSync(
    "/Users/cri/Downloads/47432_SEGNOVERDE_DOM_FIX_SICURA_GAS_726_Q32026.pdf"
  );

  const hashFile = crypto
    .createHash("sha256")
    .update(buffer)
    .digest("hex");

  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();

  const text = result.text;

  const data = {
    codiceListino: extract(
      text,
      /CODICE LISTINO:\s*(\d+)/i
    ),

    codiceOfferta: extract(
      text,
      /CODICE OFFERTA:\s*([A-Z0-9]+)/i
    ),

    prodotto: extract(
      text,
      /Prodotto Partner:\s*([^.\n]+)/i
    ),

    quotaFissa: extract(
      text,
      /Corrispettivo Annuo\s*([\d.,]+)\s*€\/PDR\/Anno/i
    ),

    quotaConsumo: extract(
      text,
      /Corrispettivo per il consumo\s*([\d.,]+)\s*€\/Smc/i
    ),

    scontoSegnoVerde: extract(
      text,
      /Sconto Corrispettivo Segno Verde\)[\s\S]*?pari a\s*([\d.,]+)\s*€\/PDR\/anno/i
    ),

    scontoMail: extract(
      text,
      /Sconto per invio fattura tramite mail\)[\s\S]*?pari a\s*([\d.,]+)\s*€\/PDR\/anno/i
    ),

    scontoSDD: extract(
      text,
      /Sconto SDD\)[\s\S]*?pari a\s*([\d.,]+)\s*€\/PDR\/anno/i
    ),
  };

  console.log(JSON.stringify(data, null, 2));

  const { data: inserted, error } = await supabase
    .from("offerte_pdf")
    .insert({
      nome_file:
        "47432_SEGNOVERDE_DOM_FIX_SICURA_GAS_726_Q32026.pdf",

      hash_file: hashFile,

      codice_listino: data.codiceListino,

      codice_offerta: data.codiceOfferta,

      nome_offerta: data.prodotto,

      commodity: "GAS",

      mercato: "LIBERO",

      tipo_prezzo: "FISSO",

      prezzo_fisso: Number(
        data.quotaConsumo.replace(",", ".")
      ),

      quota_fissa_annua: Number(
        data.quotaFissa.replace(",", ".")
      ),

      sconto_annuo: Number(
        data.scontoSegnoVerde.replace(",", ".")
      ),

      sconto_sdd: Number(
        data.scontoSDD.replace(",", ".")
      ),

      sconto_mail: Number(
        data.scontoMail.replace(",", ".")
      ),

      stato: "ATTIVA",

      data_import: new Date(),

      ultima_verifica: new Date(),

      metadata: data
    })
    .select();

  console.log("\nINSERT");
  console.log(inserted);

  console.log("\nERROR");
  console.log(error);
}

parsePdf().catch((err) => {
  console.error(err);
});