import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [offerte, setOfferte] = useState([]);
  const [ricerca, setRicerca] = useState("");

  useEffect(() => {
    loadOfferte();
  }, []);

  async function loadOfferte() {
    const { data, error } = await supabase
      .from("offerte_pdf")
      .select("*")
      .order("nome_offerta");

    if (error) {
      console.error(error);
      return;
    }

    setOfferte(data || []);
  }

  const offerteFiltrate = offerte.filter(
    (o) =>
      o.nome_offerta
        ?.toLowerCase()
        .includes(ricerca.toLowerCase()) ||
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
            "repeat(5, 1fr)",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <Card
          titolo="Offerte"
          valore={totale}
        />

        <Card titolo="EE" valore={ee} />

        <Card titolo="GAS" valore={gas} />

        <Card
          titolo="Prezzi Fissi"
          valore={fisse}
        />

        <Card
          titolo="Variabili"
          valore={variabili}
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