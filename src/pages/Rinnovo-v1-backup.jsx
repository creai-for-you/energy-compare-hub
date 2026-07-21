import { useState } from "react";

export default function Rinnovo() {
  const [testo, setTesto] = useState("");

  const [risultato, setRisultato] =
    useState(null);

  function analizza() {
    const nomeOfferta =
      testo.match(
        /Nome offerta:\s*(.+)/i
      )?.[1] || null;

    const prezzoLuce =
      testo.match(
        /([0-9.,]+)\s*€\/kWh/i
      )?.[1] || null;

    const quotaAnnua =
      testo.match(
        /([0-9.,]+)\s*€\/anno/i
      )?.[1] || null;

    const durata =
      testo.match(
        /([0-9]+)\s*mesi/i
      )?.[1] || null;

    setRisultato({
      nomeOfferta,
      prezzoLuce,
      quotaAnnua,
      durata,
    });
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
        Incolla il contenuto della
        mail o della proposta
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
          padding:
            "12px 24px",
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
              Prezzo luce:
            </strong>{" "}
            {
              risultato.prezzoLuce
            }{" "}
            €/kWh
          </p>

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
    </div>
  );
}