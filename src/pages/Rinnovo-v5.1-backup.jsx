import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Rinnovo() {
  const [testo, setTesto] = useState("");
  const [consumo, setConsumo] = useState(3000);

  const [risultato, setRisultato] = useState(null);

  const [miglioriFisse, setMiglioriFisse] =
    useState([]);

  const [
    miglioriVariabili,
    setMiglioriVariabili,
  ] = useState([]);

  async function caricaAlternative(
    commodity,
    costoRicevuto
  ) {
    const { data, error } = await supabase
      .from("offerte_pdf")
      .select("*")
      .eq("commodity", commodity);

    if (error) {
      console.error(error);
      return;
    }

    const pun = 0.11;
    const psv = 0.45;

    const classifica = (data || [])
      .map((o) => {
        let costoStimato = 0;

        if (
          o.tipo_prezzo === "FISSO" &&
          o.prezzo_fisso
        ) {
          costoStimato =
            consumo *
              Number(o.prezzo_fisso) +
            Number(
              o.quota_fissa_annua || 0
            );
        } else {
          const prezzo =
            commodity === "EE"
              ? pun +
                Number(
                  o.spread || 0
                )
              : psv +
                Number(
                  o.spread || 0
                );

          costoStimato =
            consumo * prezzo +
            Number(
              o.quota_fissa_annua || 0
            );
        }

        let canale = "STANDARD";
        let gettone = "SI";

        if (
          o.nome_offerta?.toUpperCase() ===
          "PER NOI"
        ) {
          canale = "PER_NOI";
          gettone = "NO";
        }

        return {
          ...o,
          canale,
          gettone,
          costoStimato,
          risparmio:
            costoRicevuto -
            costoStimato,
        };
      })
      .sort(
        (a, b) =>
          a.costoStimato -
          b.costoStimato
      );

    setMiglioriFisse(
      classifica
        .filter(
          (o) =>
            o.tipo_prezzo ===
            "FISSO"
        )
        .slice(0, 5)
    );

    setMiglioriVariabili(
      classifica
        .filter(
          (o) =>
            o.tipo_prezzo ===
            "VARIABILE"
        )
        .slice(0, 5)
    );
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
      tipoPrezzo =
        "VARIABILE";
    }

    const prezzo =
      Number(
        (
          prezzoLuce ||
          prezzoGas ||
          "0"
        ).replace(",", ".")
      );

    const quota =
      Number(
        (
          quotaAnnua || "0"
        ).replace(",", ".")
      );

    const costoRicevuto =
      prezzo * consumo + quota;

    setRisultato({
      nomeOfferta,
      commodity,
      tipoPrezzo,
      prezzoLuce,
      prezzoGas,
      quotaAnnua,
      durata,
      costoRicevuto,
    });

    await caricaAlternative(
      commodity,
      costoRicevuto
    );
  }

  function CardOfferta(
    offerta,
    posizione
  ) {
    return (
      <div
        key={offerta.codice_listino}
        style={{
          border:
            "1px solid #ddd",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "12px",
        }}
      >
        <h3>
          #{posizione}{" "}
          {offerta.nome_offerta}
        </h3>

        <p>
          <strong>Tipo:</strong>{" "}
          {offerta.tipo_prezzo}
        </p>

        <p>
          <strong>
            Canale:
          </strong>{" "}
          {offerta.canale}
        </p>

        <p>
          <strong>
            Gettone:
          </strong>{" "}
          {offerta.gettone}
        </p>

        <p>
          <strong>
            Prezzo:
          </strong>{" "}
          {offerta.prezzo_fisso
            ? offerta.prezzo_fisso
            : `Spread ${offerta.spread}`}
        </p>

        <p>
          <strong>
            Quota annua:
          </strong>{" "}
          {offerta.quota_fissa_annua}
          €
        </p>

        <p>
          <strong>
            Costo stimato:
          </strong>{" "}
          €
          {offerta.costoStimato.toFixed(
            2
          )}
        </p>

        <p>
          <strong>
            Risparmio:
          </strong>{" "}
          €
          {offerta.risparmio.toFixed(
            2
          )}
        </p>
      </div>
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

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <label>
          Consumo annuo
          (kWh / Smc)
        </label>

        <br />

        <input
          type="number"
          value={consumo}
          onChange={(e) =>
            setConsumo(
              Number(
                e.target.value
              )
            )
          }
          style={{
            width: "250px",
            padding: "10px",
            marginTop: "10px",
          }}
        />
      </div>

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
        }}
      >
        Analizza
      </button>

      {risultato && (
        <div
          style={{
            marginTop: "30px",
            border:
              "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2>
            Offerta Ricevuta
          </h2>

          <p>
            <strong>
              Nome:
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
              Tipo:
            </strong>{" "}
            {
              risultato.tipoPrezzo
            }
          </p>

          <p>
            <strong>
              Costo stimato:
            </strong>{" "}
            €
            {risultato.costoRicevuto.toFixed(
              2
            )}
          </p>
        </div>
      )}

      {miglioriFisse.length >
        0 && (
        <>
          <h2
            style={{
              marginTop: "40px",
            }}
          >
            🏆 Migliori 5
            Offerte FISSE
          </h2>

          {miglioriFisse.map(
            (
              offerta,
              index
            ) =>
              CardOfferta(
                offerta,
                index + 1
              )
          )}
        </>
      )}

      {miglioriVariabili.length >
        0 && (
        <>
          <h2
            style={{
              marginTop: "40px",
            }}
          >
            ⚡ Migliori 5
            Offerte VARIABILI
          </h2>

          {miglioriVariabili.map(
            (
              offerta,
              index
            ) =>
              CardOfferta(
                offerta,
                index + 1
              )
          )}
        </>
      )}
    </div>
  );
}