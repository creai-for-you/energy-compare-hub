import Admin from "./pages/Admin";
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [offerte, setOfferte] = useState([])

  const [consumoLuce, setConsumoLuce] = useState(3727)
  const [consumoGas, setConsumoGas] = useState(800)
  const [potenza] = useState(4.5)

  const [pun, setPun] = useState(0)
  const [psv, setPsv] = useState(0)

  const [costiRegolati, setCostiRegolati] = useState({
    quota_rete_kwh: 0,
    quota_potenza_kw: 0,
    quota_fissa_annua: 0,
    oneri_kwh: 0,
    iva: 0
  })

  useEffect(() => {
    async function loadData() {
      const { data: offerteData } = await supabase
        .from('offerte')
        .select('*')

      setOfferte(offerteData || [])

      const { data: mercatoData } = await supabase
        .from('mercato')
        .select('*')

      if (mercatoData?.length > 0) {
        setPun(Number(mercatoData[0].pun))
        setPsv(Number(mercatoData[0].psv))
      }

      const { data: costiData } = await supabase
        .from('costi_regolati')
        .select('*')

      if (costiData?.length > 0) {
        setCostiRegolati(costiData[0])
      }
    }

    loadData()
  }, [])

  const calcolaCostoLuce = (offerta) => {
    let prezzoEnergia = 0

    if (offerta.tipologia === 'variabile') {
      prezzoEnergia = pun + Number(offerta.spread || 0)
    } else {
      prezzoEnergia = Number(offerta.prezzo_fisso || 0)
    }

    const energia =
      consumoLuce * prezzoEnergia

    const rete =
      consumoLuce *
      Number(costiRegolati.quota_rete_kwh)

    const potenzaCosto =
      potenza *
      Number(costiRegolati.quota_potenza_kw)

    const oneri =
      consumoLuce *
      Number(costiRegolati.oneri_kwh)

    const quotaFissa =
      Number(offerta.quota_fissa_annua || 0) +
      Number(costiRegolati.quota_fissa_annua)

    const imponibile =
      energia +
      rete +
      potenzaCosto +
      oneri +
      quotaFissa

    const iva =
      imponibile *
      Number(costiRegolati.iva)

    const totale =
      imponibile +
      iva -
      Number(offerta.sconto_annuo || 0)

    return {
      ...offerta,
      energia,
      rete,
      potenzaCosto,
      oneri,
      iva,
      totale
    }
  }

  const risultatiLuce = offerte
    .filter((o) => o.tipo === 'luce')
    .map(calcolaCostoLuce)
    .sort((a, b) => a.totale - b.totale)

  const risultatiGas = offerte
    .filter((o) => o.tipo === 'gas')
    .map((o) => {
      const prezzo =
        o.tipologia === 'variabile'
          ? psv + Number(o.spread || 0)
          : Number(o.prezzo_fisso || 0)

      const totale =
        consumoGas * prezzo +
        Number(o.quota_fissa_annua || 0)

      return {
        ...o,
        totale
      }
    })
    .sort((a, b) => a.totale - b.totale)

  const peggiorLuce =
    risultatiLuce.length > 0
      ? risultatiLuce[risultatiLuce.length - 1].totale
      : 0

      if (window.location.pathname === "/admin") {
  return <Admin />;
}
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
        fontFamily: 'Arial'
      }}
    >
      <h1>Comparatore Energia</h1>

      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '12px'
        }}
      >
        <h2>Profilo Cliente</h2>

        <p>
          Consumo luce:
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
          Consumo gas:
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
      </div>

      <h2>PUN: {pun}</h2>
      <h2>PSV: {psv}</h2>

      <h2>⚡ Classifica Luce</h2>

      {risultatiLuce.map((o, idx) => (
        <div
          key={o.id}
          style={{
            marginBottom: '20px',
            padding: '20px',
            border:
              idx === 0
                ? '3px solid green'
                : '1px solid #ddd',
            borderRadius: '12px',
            background:
              idx === 0
                ? '#f0fff0'
                : 'white'
          }}
        >
          <h3>
            #{idx + 1} - {o.nome}
          </h3>

          {idx === 0 && (
            <p>
              🥇
              <strong>
                {' '}
                MIGLIORE OFFERTA
              </strong>
            </p>
          )}

          <p>Energia: € {o.energia.toFixed(2)}</p>
          <p>Rete: € {o.rete.toFixed(2)}</p>
          <p>
            Potenza: € {o.potenzaCosto.toFixed(2)}
          </p>
          <p>Oneri: € {o.oneri.toFixed(2)}</p>
          <p>IVA: € {o.iva.toFixed(2)}</p>

          <p>
            <strong>
              Totale:
              € {o.totale.toFixed(2)}
            </strong>
          </p>

          <p>
            Risparmio:
            € {(peggiorLuce - o.totale).toFixed(2)}
          </p>
        </div>
      ))}

      <h2>🔥 Classifica Gas</h2>

      {risultatiGas.map((o, idx) => (
        <div
          key={o.id}
          style={{
            marginBottom: '20px',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #ddd'
          }}
        >
          <h3>
            #{idx + 1} - {o.nome}
          </h3>

          <p>
            Totale:
            € {o.totale.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  )
}

export default App