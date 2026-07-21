import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Rinnovo() {
  const [testo, setTesto] = useState("");
  const [risultato, setRisultato] = useState(null);
  const [alternative, setAlternative] = useState([]);

  async function caricaAlternative(
    commodity,
    tipoPrezzo
  ) {
    let query = supabase
      .from("offerte_pdf")
      .select("*")
      .eq("commodity", commodity);

    const { data, error } =
      await query.order(
        "quota_fissa_annua",
        {
          ascending: true,
        }
      );

    if (error) {
      console.error(error);
      return;
    }

    setAlternative(data || []);
  }

  async function analizza() {
    const nomeOfferta =
      testo.match(
        /Nome offerta:\s*(.+)/i
      )?.[1]?.trim() || null;

    const prezzoLuce =
      testo.match(
        /([0-9.,]+)\s*€\/kWh/i
      )?.[1] || null;

    const prezzoGas =
      testo.match(
        /([0-9.,]+)\s*€\/Smc/i
      )?.[1] || null;

    const quotaAnnua =
      testo.match(
        /([0-9.,]+)\s*€\/anno/i
      )?.[1] || null;

    const durata =
      testo.match(
        /([0-9]+)\s*mesi/i
      )?.[1] || null;

    let commodity =
      "NON RILEVATA";

    if (/€\/kWh/i.test(testo)) {
      commodity = "EE";
    }

    if (/€\/Smc/i.test(testo)) {
      commodity = "GAS";
    }

    let tipoPrezzo =
      "NON RILEVATO";

    if (
      /prezzo bloccato/i.test(testo) ||
      /prezzo fisso/i.test(testo)
    ) {
      tipoPrezzo = "FISSO";
    }

    if (
      /PUN/i.test(testo) ||
      /PSV/i.test(testo) ||
      /spread/i.test(testo)
    ) {
      tipoPrezzo = "VARIABILE";
    }

    const risultatoTmp = {
      nomeOfferta,
      commodity,
      tipoPrezzo,
      prezzoLuce,
      prezzoGas,
      quotaAnnua,
      durata,
    };

    setRisultato(risultatoTmp);

    await caricaAlternative(
      commodity,
      tipoPrezzo
    );
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1>
        Analisi Rinnovo Commerciale
      </h1>

      <p>
        Incolla il contenuto
        dell'email o della proposta
        commerciale ricevuta.
      </p>

      <textarea
        value={testo}
        onChange={(e) =>
          setTesto(e.target.value)
        }
        rows={15}
        style={{
          width: "100%",
          padding: "15px",
        }}
      />

      <button
        onClick={analizza}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          cursor: "pointer",
        }}
      >
        Analizza
      </button>

      {risultato && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border:
              "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <h2>
            Risultato Analisi
          </h2>

          <p>
            <strong>
              Nome offerta:
            </strong>{" "}
            {
              risultato.nomeOfferta
            }
          </p>

          <p>
            <strong>
              Commodity:
            </strong>{" "}
            {
              risultato.commodity
            }
          </p>

          <p>
            <strong>
              Tipo prezzo:
            </strong>{" "}
            {
              risultato.tipoPrezzo
            }
          </p>

          {risultato.prezzoLuce && (
            <p>
              <strong>
                Prezzo luce:
              </strong>{" "}
              {
                risultato.prezzoLuce
              }{" "}
              €/kWh
            </p>
          )}

          {risultato.prezzoGas && (
            <p>
              <strong>
                Prezzo gas:
              </strong>{" "}
              {
                risultato.prezzoGas
              }{" "}
              €/Smc
            </p>
          )}

          <p>
            <strong>
              Quota annua:
            </strong>{" "}
            {
              risultato.quotaAnnua
            }{" "}
            €/anno
          </p>

          <p>
            <strong>
              Durata:
            </strong>{" "}
            {
              risultato.durata
            }{" "}
            mesi
          </p>
        </div>
      )}

      {alternative.length > 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border:
              "1px solid #ddd",
            borderRadius: "12px",
          }}
        >
          <h2>
            Offerte Compatibili
          </h2>

          {alternative.map((o) => (
            <div
              key={
                o.codice_listino
              }
              style={{
                padding: "12px 0",
                borderBottom:
                  "1px solid #eee",
              }}
            >
              <strong>
                {o.nome_offerta}
              </strong>

              <br />

              Commodity:
              {" "}
              {o.commodity}

              <br />

              Tipo:
              {" "}
              {o.tipo_prezzo}

              <br />

              {o.prezzo_fisso ? (
                <>
                  Prezzo:
                  {" "}
                  {o.prezzo_fisso}
                </>
              ) : (
                <>
                  Spread:
                  {" "}
                  {o.spread}
                </>
              )}

              <br />

              Quota annua:
              {" "}
              {
                o.quota_fissa_annua
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}