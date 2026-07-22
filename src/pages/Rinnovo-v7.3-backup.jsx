
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Rinnovo() {
  const [testo, setTesto] = useState("");
  const [consumo, setConsumo] = useState(3000);
const [profilo, setProfilo] =
  useState("CLIENTE");
  const [pun, setPun] = useState(0);
  const [psv, setPsv] = useState(0);
  
const [profiloBolletta, setProfiloBolletta] =
  useState(null);

  const [risultato, setRisultato] = useState(null);

  const [miglioriFisse, setMiglioriFisse] =
    useState([]);

  const [
    miglioriVariabili,
    setMiglioriVariabili,
  ] = useState([]);

  useEffect(() => {
  caricaMercato();

  const profiloSalvato =
    localStorage.getItem(
      "profilo_bolletta"
    );

  if (profiloSalvato) {
  const profilo =
    JSON.parse(profiloSalvato);

  setProfiloBolletta(
    profilo
  );

  if (profilo.consumoLuce) {
    setConsumo(
      Number(
        profilo.consumoLuce
      )
    );
  }
}
}, []);

  async function caricaMercato() {
    const { data, error } = await supabase
      .from("mercato")
      .select("*")
      .order("data_rilevazione", {
        ascending: false,
      })
      .limit(1);

    if (error) {
      console.error(error);
      return;
    }

    if (data?.length) {
      setPun(Number(data[0].pun));
      setPsv(Number(data[0].psv));
    }
  }

  async function caricaAlternative(
  commodity,
  costoRicevuto
) {
  const { data: offerteData, error } =
    await supabase
      .from("offerte_pdf")
      .select("*")
      .eq("commodity", commodity);

  if (error) {
    console.error(error);
    return;
  }

  const { data: repositoryData } =
    await supabase
      .from("repository_drive")
      .select(
        "codice_listino,categoria_drive"
      );

  const repositoryMap = new Map();

  (repositoryData || []).forEach((r) => {
    repositoryMap.set(
      String(r.codice_listino),
      r.categoria_drive
    );
  });

  const classifica = (offerteData || [])
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
              Number(o.spread || 0)
            : psv +
              Number(o.spread || 0);

        costoStimato =
          consumo * prezzo +
          Number(
            o.quota_fissa_annua || 0
          );
      }

      const categoriaDrive =
        repositoryMap.get(
          String(o.codice_listino)
        ) || "";

      let canale = "STANDARD";
      let gettone = "SI";

      if (
        categoriaDrive === "PER NOI"
      ) {
        canale = "PER_NOI";
        gettone = "NO";
      } else if (
        categoriaDrive ===
        "LISTINI WEB"
      ) {
        canale = "WEB";
        gettone = "NO";
      }

      return {
        ...o,
        categoriaDrive,
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
let classificaFiltrata =
  classifica;

if (profilo === "CLIENTE") {
  classificaFiltrata =
    classifica.filter(
      (o) =>
        o.canale !== "PER_NOI"
    );
}

  setMiglioriFisse(
    classificaFiltrata
      .filter(
        (o) =>
          o.tipo_prezzo === "FISSO"
      )
      .slice(0, 5)
  );

  setMiglioriVariabili(
    classificaFiltrata
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

    const profiloSalvato =
  localStorage.getItem(
    "profilo_bolletta"
  );

if (profiloSalvato) {
  const profilo =
    JSON.parse(profiloSalvato);

  if (
    commodity === "EE" &&
    profilo.consumoLuce
  ) {
    setConsumo(
      Number(
        profilo.consumoLuce
      )
    );
  }

  if (
    commodity === "GAS" &&
    profilo.consumoGas
  ) {
    setConsumo(
      Number(
        profilo.consumoGas
      )
    );
  }
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
      consumo,
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
          border: "1px solid #ddd",
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
          <strong>Canale:</strong>{" "}
          {offerta.canale}
        </p>
        <p>
         <strong>Categoria:</strong>{" "}
         {offerta.categoriaDrive}
        </p>
        <p>
          <strong>Gettone:</strong>{" "}
          {offerta.gettone}
        </p>

        <p>
          <strong>Prezzo:</strong>{" "}
          {offerta.prezzo_fisso
            ? offerta.prezzo_fisso
            : `Spread ${offerta.spread}`}
        </p>

        <p>
          <strong>
            Quota annua:
          </strong>{" "}
          {offerta.quota_fissa_annua} €
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

        {offerta.risparmio >= 0 ? (
  <p
    style={{
      color: "green",
      fontWeight: "bold",
    }}
  >
    🟢 Risparmio: €
    {offerta.risparmio.toFixed(2)}
  </p>
) : (
  <p
    style={{
      color: "red",
      fontWeight: "bold",
    }}
  >
    🔴 Maggior costo: €
    {Math.abs(
      offerta.risparmio
    ).toFixed(2)}
  </p>
)}
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
{profiloBolletta && (
  <div
    style={{
      marginTop: "20px",
      marginBottom: "20px",
      border: "1px solid #ddd",
      padding: "20px",
      borderRadius: "12px",
      background: "#f9f9f9",
    }}
  >
    <h2>
      Profilo Bolletta
    </h2>

    <p>
      <strong>Cliente:</strong>{" "}
      {profiloBolletta.tipoCliente}
    </p>

    <p>
      <strong>Consumo Luce:</strong>{" "}
      {profiloBolletta.consumoLuce} kWh
    </p>

    <p>
      <strong>Consumo Gas:</strong>{" "}
      {profiloBolletta.consumoGas} Smc
    </p>

    <p>
      <strong>Potenza:</strong>{" "}
      {profiloBolletta.potenza} kW
    </p>
  </div>
)}
      <p>
        <strong>PUN:</strong> {pun}
        {" | "}
        <strong>PSV:</strong> {psv}
      </p>

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <div
  style={{
    marginBottom: "20px",
  }}
>
  <label>Profilo</label>

  <br />

  <select
    value={profilo}
    onChange={(e) =>
      setProfilo(e.target.value)
    }
    style={{
      padding: "10px",
      width: "250px",
      marginTop: "10px",
    }}
  >
    <option value="CLIENTE">
      CLIENTE
    </option>

    <option value="DEALER">
      DEALER
    </option>

    <option value="ADMIN">
      ADMIN
    </option>
  </select>
</div>
        <label>
          Consumo annuo (kWh / Smc)
        </label>

        <br />

        <input
          type="number"
          value={consumo}
          onChange={(e) =>
            setConsumo(
              Number(e.target.value)
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
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2>
            Offerta Ricevuta
          </h2>

          <p>
            <strong>Nome:</strong>{" "}
            {risultato.nomeOfferta}
          </p>

          <p>
            <strong>Commodity:</strong>{" "}
            {risultato.commodity}
          </p>

          <p>
            <strong>Tipo:</strong>{" "}
            {risultato.tipoPrezzo}
          </p>

          {risultato.prezzoLuce && (
            <p>
              <strong>
                Prezzo luce:
              </strong>{" "}
              {risultato.prezzoLuce}
              {" "}€/kWh
            </p>
          )}

          {risultato.prezzoGas && (
            <p>
              <strong>
                Prezzo gas:
              </strong>{" "}
              {risultato.prezzoGas}
              {" "}€/Smc
            </p>
          )}

          <p>
            <strong>
              Quota annua:
            </strong>{" "}
            {risultato.quotaAnnua}
            €
          </p>

          <p>
            <strong>Durata:</strong>{" "}
            {risultato.durata}
            {" "}mesi
          </p>

          <p>
            <strong>
              Consumo:
            </strong>{" "}
            {risultato.consumo}
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

      {miglioriFisse.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px" }}>
            🏆 Migliori 5 FISSE
          </h2>

          {miglioriFisse.map(
            (o, index) =>
              CardOfferta(
                o,
                index + 1
              )
          )}
        </>
      )}

      {miglioriVariabili.length > 0 && (
        <>
          <h2 style={{ marginTop: "40px" }}>
            ⚡ Migliori 5 VARIABILI
          </h2>

          {miglioriVariabili.map(
            (o, index) =>
              CardOfferta(
                o,
                index + 1
              )
          )}
        </>
      )}
    </div>
  );
}