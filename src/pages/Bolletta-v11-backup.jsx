import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Bolletta() {
  const [tipoCliente, setTipoCliente] =
    useState("DOMESTICO");
  
    const [filePdf, setFilePdf] =
  useState(null);

  const [pod, setPod] = useState("");
  const [pdr, setPdr] = useState("");

  const [consumoLuce, setConsumoLuce] =
    useState("3000");

  const [consumoGas, setConsumoGas] =
    useState("800");

  const [potenza, setPotenza] =
    useState(4.5);

  const [spesaLuce, setSpesaLuce] =
    useState("");

  const [spesaGas, setSpesaGas] =
    useState("");
async function salvaProfilo() {
  const { error } = await supabase
    .from("profili_cliente")
    .insert([
      {
        tipo_cliente: tipoCliente,
        pod,
        pdr,

        consumo_luce:
          consumoLuce === ""
            ? null
            : Number(consumoLuce),

        consumo_gas:
          consumoGas === ""
            ? null
            : Number(consumoGas),

        potenza:
          potenza === ""
            ? null
            : Number(potenza),

        spesa_luce:
          spesaLuce === ""
            ? null
            : Number(spesaLuce),

        spesa_gas:
          spesaGas === ""
            ? null
            : Number(spesaGas),
      },
    ]);

  if (error) {
    console.error(error);
    alert("Errore durante il salvataggio.");
    return;
  }

  alert("Profilo salvato su Supabase.");
}

async function caricaUltimoProfilo() {
  const { data, error } =
    await supabase
      .from("profili_cliente")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(1);

  if (error) {
    console.error(error);
    alert(
      "Errore caricamento profilo."
    );
    return;
  }

  if (!data?.length) {
    alert(
      "Nessun profilo trovato."
    );
    return;
  }

  const profilo = data[0];

  setTipoCliente(
    profilo.tipo_cliente || "DOMESTICO"
  );

  setPod(profilo.pod || "");
  setPdr(profilo.pdr || "");

  setConsumoLuce(
    String(
      profilo.consumo_luce || ""
    )
  );

  setConsumoGas(
    String(
      profilo.consumo_gas || ""
    )
  );

  setPotenza(
    String(
      profilo.potenza || ""
    )
  );

  setSpesaLuce(
    String(
      profilo.spesa_luce || ""
    )
  );

  setSpesaGas(
    String(
      profilo.spesa_gas || ""
    )
  );

  alert(
    "Ultimo profilo caricato."
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
      <h1>Analisi Bolletta</h1>
<h2>Upload Bolletta PDF</h2>

<input
  type="file"
  accept=".pdf"
  onChange={(e) =>
    setFilePdf(
      e.target.files?.[0] || null
    )
  }
/>

{filePdf && (
  <p>
    <strong>File:</strong>{" "}
    {filePdf.name}
  </p>
)}

<button
  onClick={() => {
    if (!filePdf) {
      alert(
        "Seleziona un PDF."
      );
      return;
    }

    alert(
      `PDF selezionato: ${filePdf.name}`
    );
  }}
  style={{
    padding: "12px 24px",
    marginTop: "10px",
    cursor: "pointer",
  }}
>
  Analizza PDF
</button>

<hr />
      <h2>Tipologia Cliente</h2>

      <select
        value={tipoCliente}
        onChange={(e) =>
          setTipoCliente(e.target.value)
        }
      >
        <option value="DOMESTICO">
          Domestico
        </option>

        <option value="BUSINESS">
          Business
        </option>

        <option value="CONDOMINIO">
          Condominio
        </option>
      </select>

      <hr />

      <h2>Energia Elettrica</h2>

      <p>
        POD
        <br />
        <input
          type="text"
          value={pod}
          onChange={(e) =>
            setPod(e.target.value)
          }
        />
      </p>

      <p>
        Consumo annuo (kWh)
        <br />
        <input
          type="number"
          value={consumoLuce}
          onChange={(e) =>
            setConsumoLuce(
              (e.target.value)
            )
          }
        />
      </p>

      <p>
        Potenza impegnata (kW)
        <br />
        <input
          type="number"
          step="0.5"
          value={potenza}
          onChange={(e) =>
            setPotenza(
              (e.target.value)
            )
          }
        />
      </p>

      <p>
        Spesa annua (€)
        <br />
        <input
          type="number"
          value={spesaLuce}
          onChange={(e) =>
            setSpesaLuce(
              e.target.value
            )
          }
        />
      </p>

      <hr />

      <h2>Gas</h2>

      <p>
        PDR
        <br />
        <input
          type="text"
          value={pdr}
          onChange={(e) =>
            setPdr(e.target.value)
          }
        />
      </p>

      <p>
        Consumo annuo (Smc)
        <br />
        <input
          type="number"
          value={consumoGas}
          onChange={(e) =>
            setConsumoGas(
                (e.target.value)
            )
          }
        />
      </p>

      <p>
        Spesa annua (€)
        <br />
        <input
          type="number"
          value={spesaGas}
          onChange={(e) =>
            setSpesaGas(
              e.target.value
            )
          }
        />
      </p>

      <hr />

      <h2>Riepilogo Profilo</h2>

      <p>
        <strong>Cliente:</strong>{" "}
        {tipoCliente}
      </p>

      <p>
        <strong>POD:</strong> {pod}
      </p>

      <p>
        <strong>PDR:</strong> {pdr}
      </p>

      <p>
        <strong>
          Consumo Luce:
        </strong>{" "}
        {consumoLuce} kWh
      </p>

      <p>
        <strong>
          Potenza:
        </strong>{" "}
        {potenza} kW
      </p>

      <p>
        <strong>
          Consumo Gas:
        </strong>{" "}
        {consumoGas} Smc
      </p>

      <p>
        <strong>
          Spesa Luce:
        </strong>{" "}
        € {spesaLuce || 0}
      </p>

      <p>
        <strong>
          Spesa Gas:
        </strong>{" "}
        € {spesaGas || 0}
      </p>
      <button
  onClick={() => {
    localStorage.setItem(
      "profilo_bolletta",
      JSON.stringify({
        tipoCliente,
        pod,
        pdr,
        consumoLuce,
        consumoGas,
        potenza,
        spesaLuce,
        spesaGas,
      })
    );

    alert(
      "Profilo salvato. Vai su /rinnovo per usarlo."
    );
  }}
  style={{
    padding: "12px 24px",
    marginTop: "20px",
    cursor: "pointer",
  }}
>
  Usa per il confronto
  </button>
  
<button
  onClick={salvaProfilo}
  style={{
    padding: "12px 24px",
    marginLeft: "10px",
    cursor: "pointer",
  }}
>
  Salva su Supabase
</button>
<button
  onClick={caricaUltimoProfilo}
  style={{
    padding: "12px 24px",
    marginLeft: "10px",
    cursor: "pointer",
  }}
>
  Carica ultimo profilo
</button>
    </div>
  );
}