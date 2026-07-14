import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [offerte, setOfferte] = useState([])

  const [consumoLuce, setConsumoLuce] = useState(3727)
  const [consumoGas, setConsumoGas] = useState(800)

  const [pun, setPun] = useState(0)
  const [psv, setPsv] = useState(0)

  useEffect(() => {
    async function loadData() {
      const { data: offerteData } = await supabase
        .from('offerte')
        .select('*')

      setOfferte(offerteData || [])

      const { data: mercatoData } = await supabase
        .from('mercato')
        .select('*')

      if (mercatoData && mercatoData.length > 0) {
        setPun(Number(mercatoData[0].pun))
        setPsv(Number(mercatoData[0].psv))
      }
    }

    loadData()
  }, [])

  const risultatiLuce = offerte
    .filter((o) => o.tipo === 'luce')
    .map((o) => {
      let prezzo = 0

      if (o.tipologia === 'variabile') {
        prezzo = pun + Number(o.spread || 0)
      } else {
        prezzo = Number(o.prezzo_fisso || 0)
      }

      const costo =
        consumoLuce * prezzo +
        Number(o.quota_fissa_annua || 0) -
        Number(o.sconto_annuo || 0)

      return {
        ...o,
        prezzo,
        costo
      }
    })
    .sort((a, b) => a.costo - b.costo)

  const risultatiGas = offerte
    .filter((o) => o.tipo === 'gas')
    .map((o) => {
      let prezzo = 0

      if (o.tipologia === 'variabile') {
        prezzo = psv + Number(o.spread || 0)
      } else {
        prezzo = Number(o.prezzo_fisso || 0)
      }

      const costo =
        consumoGas * prezzo +
        Number(o.quota_fissa_annua || 0) -
        Number(o.sconto_annuo || 0)

      return {
        ...o,
        prezzo,
        costo
      }
    })
    .sort((a, b) => a.costo - b.costo)

  const peggiorLuce =
    risultatiLuce.length > 0
      ? risultatiLuce[risultatiLuce.length - 1].costo
      : 0

  const peggiorGas =
    risultatiGas.length > 0
      ? risultatiGas[risultatiGas.length - 1].costo
      : 0

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h1 style={{ textAlign: 'center' }}>
        Comparatore Energia
      </h1>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '30px'
        }}
      >
        <h2>Profilo Cliente</h2>

        <div style={{ marginBottom: '15px' }}>
          <label>Consumo Luce (kWh/anno)</label>
          <br />

          <input
            type="number"
            value={consumoLuce}
            onChange={(e) =>
              setConsumoLuce(Number(e.target.value))
            }
          />
        </div>

        <div>
          <label>Consumo Gas (Smc/anno)</label>
          <br />

          <input
            type="number"
            value={consumoGas}
            onChange={(e) =>
              setConsumoGas(Number(e.target.value))
            }
          />
        </div>
      </div>

      <div
        style={{
          marginBottom: '30px'
        }}
      >
        <h2>PUN attuale: {pun}</h2>
        <h2>PSV attuale: {psv}</h2>
      </div>

      <h2>⚡ Classifica Luce</h2>

      {risultatiLuce.map((offerta, index) => {
        const risparmio =
          peggiorLuce - offerta.costo

        return (
          <div
            key={offerta.id}
            style={{
              border:
                index === 0
                  ? '3px solid green'
                  : '1px solid #ddd',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '10px',
              background:
                index === 0
                  ? '#f0fff0'
                  : 'white'
            }}
          >
            <h3>
              #{index + 1} - {offerta.nome}
            </h3>

            {index === 0 && (
              <p>
                🥇 <strong>MIGLIORE OFFERTA</strong>
              </p>
            )}

            <p>Fornitore: {offerta.fornitore}</p>

            <p>
              Prezzo Energia: €
              {offerta.prezzo.toFixed(4)}
            </p>

            <p>
              Costo Stimato: €
              {offerta.costo.toFixed(2)}
            </p>

            <p>
              Risparmio: €
              {risparmio.toFixed(2)}
            </p>
          </div>
        )
      })}

      <h2
        style={{
          marginTop: '50px'
        }}
      >
        🔥 Classifica Gas
      </h2>

      {risultatiGas.map((offerta, index) => {
        const risparmio =
          peggiorGas - offerta.costo

        return (
          <div
            key={offerta.id}
            style={{
              border:
                index === 0
                  ? '3px solid green'
                  : '1px solid #ddd',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '10px',
              background:
                index === 0
                  ? '#f0fff0'
                  : 'white'
            }}
          >
            <h3>
              #{index + 1} - {offerta.nome}
            </h3>

            {index === 0 && (
              <p>
                🥇 <strong>MIGLIORE OFFERTA GAS</strong>
              </p>
            )}

            <p>Fornitore: {offerta.fornitore}</p>

            <p>
              Prezzo Gas: €
              {offerta.prezzo.toFixed(4)}
            </p>

            <p>
              Costo Stimato: €
              {offerta.costo.toFixed(2)}
            </p>

            <p>
              Risparmio: €
              {risparmio.toFixed(2)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default App