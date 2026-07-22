import { useState } from "react";

export default function Bolletta() {
  const [tipoCliente, setTipoCliente] =
    useState("DOMESTICO");

  const [pod, setPod] = useState("");
  const [pdr, setPdr] = useState("");

  const [consumoLuce, setConsumoLuce] =
    useState(3000);

  const [consumoGas, setConsumoGas] =
    useState(800);

  const [potenza, setPotenza] =
    useState(4.5);

  const [spesaLuce, setSpesaLuce] =
    useState("");

  const [spesaGas, setSpesaGas] =
    useState("");

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
              Number(e.target.value)
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
              Number(e.target.value)
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
              Number(e.target.value)
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
    </div>
  );
}