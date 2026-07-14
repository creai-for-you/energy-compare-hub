import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [offerte, setOfferte] = useState([])
  const [consumoLuce, setConsumoLuce] = useState(3727)
  const [pun, setPun] = useState('CARICAMENTO...')

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('offerte')
        .select('*')

      setOfferte(data || [])

      const result = await supabase
        .from('mercato')
        .select('*')

      console.log(result)

      if (result.data && result.data.length > 0) {
        setPun(result.data[0].pun)
      } else {
        setPun('NESSUN DATO')
      }
    }

    loadData()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>Comparatore Energia</h1>

      <div
        style={{
          border: '1px solid #ddd',
          padding: '20px',
          marginBottom: '30px',
          borderRadius: '8px'
        }}
      >
        <h2>Profilo Cliente</h2>

        <label>Consumo Luce (kWh/anno)</label>

        <br />

        <input
          type="number"
          value={consumoLuce}
          onChange={(e) => setConsumoLuce(Number(e.target.value))}
        />
      </div>

      <h2>PUN attuale: {pun}</h2>

      <h2>Offerte trovate: {offerte.length}</h2>

      {offerte.map((offerta) => (
        <div
          key={offerta.id}
          style={{
            border: '1px solid #ddd',
            padding: '12px',
            marginBottom: '10px'
          }}
        >
          <strong>{offerta.nome}</strong>
          <br />
          {offerta.fornitore}
        </div>
      ))}
    </div>
  )
}

export default App