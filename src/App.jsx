import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [offerte, setOfferte] = useState([])
  const [consumoLuce, setConsumoLuce] = useState(3727)
  const [pun, setPun] = useState(0)

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('offerte')
        .select('*')

      setOfferte(data || [])

      const { data: mercato } = await supabase
        .from('mercato')
        .select('*')

      if (mercato && mercato.length > 0) {
        setPun(Number(mercato[0].pun))
      }
    }

    loadData()
  }, [])

  const risultati = offerte
    .filter((o) => o.tipo === 'luce')
    .map((o) => {
      let prezzoEnergia = 0

      if (o.tipologia === 'variabile') {
        prezzoEnergia = pun + Number(o.spread || 0)
      } else {
        prezzoEnergia = Number(o.prezzo_fisso || 0)
      }

      const costo =
        consumoLuce * prezzoEnergia +
        Number(o.quota_fissa_annua || 0) -
        Number(o.sconto_annuo || 0)

      return {
        ...o,
        costo
      }
    })
    .sort((a, b) => a.costo - b.costo)

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>Comparatore Energia</h1>

      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}
      >
        <h2>Profilo Cliente</h2>

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

      <h2>PUN attuale: {pun}</h2>

      <h2>Classifica Offerte</h2>

      {risultati.map((offerta, index) => (
        <div
          key={offerta.id}
          style={{
            border: '1px solid #ddd',
            padding: '16px',
            marginBottom: '10px',
            borderRadius: '8px'
          }}
        >
          <h3>
            #{index + 1} - {offerta.nome}
          </h3>

          <p>Fornitore: {offerta.fornitore}</p>

          <p>
            Costo stimato:{' '}
            <strong>
              € {offerta.costo.toFixed(2)}
            </strong>
          </p>
        </div>
      ))}
    </div>
  )
}

export default App