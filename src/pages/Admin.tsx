import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [offerte, setOfferte] = useState([]);
  const [ricerca, setRicerca] = useState("");

  useEffect(() => {
    loadOfferte();
  }, []);

  async function loadOfferte() {
    const { data: offerteData, error } =
      await supabase
        .from("offerte_pdf")
        .select("*")
        .order("nome_offerta");

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

    const arricchite = (
      offerteData || []
    ).map((o) => {
      const categoria =
        repositoryMap.get(
          String(o.codice_listino)
        ) || "";

      let canale = "STANDARD";
      let gettone = "SI";

      if (categoria === "PER NOI") {
        canale = "PER_NOI";
        gettone = "NO";
      }

      if (
        categoria === "LISTINI WEB"
      ) {
        canale = "WEB";
        gettone = "NO";
      }

      return {
        ...o,
        categoria_drive: categoria,
        canale,
        gettone,
      };
    });

    setOfferte(arricchite);
  }

  const offerteFiltrate = offerte.filter(
    (o) =>
      o.nome_offerta
        ?.toLowerCase()
        .includes(
          ricerca.toLowerCase()
        ) ||
      o.codice_listino
        ?.toString()
        .includes(ricerca)
  );

  const totale = offerte.length;

  const ee = offerte.filter(
    (o) => o.commodity === "EE"
  ).length;

  const gas = offerte.filter(
    (o) => o.commodity === "GAS"
  ).length;

  const fisse = offerte.filter(
    (o) => o.prezzo_fisso !== null
  ).length;

  const variabili = offerte.filter(
    (o) => o.spread !== null
  ).length;

  const perNoi = offerte.filter(
    (o) => o.canale === "PER_NOI"
  ).length;

  const web = offerte.filter(
    (o) => o.canale === "WEB"
  ).length;

  const standard = offerte.filter(
    (o) => o.canale === "STANDARD"
  ).length;

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1>Dashboard Admin</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(8, 1fr)",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <Card
          titolo="Offerte"
          valore={totale}
        />

        <Card
          titolo="EE"
          valore={ee}
        />

        <Card
          titolo="GAS"
          valore={gas}
        />

        <Card
          titolo="Prezzi Fissi"
          valore={fisse}
        />

        <Card
          titolo="Variabili"
          valore={variabili}
        />

        <Card
          titolo="PER NOI"
          valore={perNoi}
        />

        <Card
          titolo="WEB"
          valore={web}
        />

        <Card
          titolo="STANDARD"
          valore={standard}
        />
      </div>

      <input
        type="text"
        placeholder="Cerca offerta o listino..."
        value={ricerca}
        onChange={(e) =>
          setRicerca(e.target.value)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
        }}
      />

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
        }}
      >
        <thead>
          <tr>
            <th>Listino</th>
            <th>Offerta</th>
            <th>Commodity</th>
            <th>Tipo</th>
            <th>Canale</th>
            <th>Gettone</th>
            <th>Prezzo Fisso</th>
            <th>Spread</th>
            <th>Quota Annua</th>
          </tr>
        </thead>

        <tbody>
          {offerteFiltrate.map((o) => (
            <tr key={o.codice_listino}>
              <td>{o.codice_listino}</td>

              <td>{o.nome_offerta}</td>

              <td>{o.commodity}</td>

              <td>{o.tipo_prezzo}</td>

              <td>{o.canale}</td>

              <td>{o.gettone}</td>

              <td>
                {o.prezzo_fisso ?? "-"}
              </td>

              <td>
                {o.spread ?? "-"}
              </td>

              <td>
                {o.quota_fissa_annua}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ titolo, valore }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,.1)",
      }}
    >
      <h3>{titolo}</h3>

      <div
        style={{
          fontSize: "32px",
          fontWeight: "bold",
        }}
      >
        {valore}
      </div>
    </div>
  );
}