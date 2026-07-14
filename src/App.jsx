import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [offerte, setOfferte] = useState([])
  const [errore, setErrore] = useState('')

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from('offerte')
        .select('*')

      if (error) {
        setErrore(error.message)
      } else {
        setOfferte(data || [])
      }
    }

    loadData()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>Comparatore Energia</h1>

      {errore && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Errore: {errore}
        </div>
      )}

      <h2>Offerte trovate: {offerte.length}</h2>

      {offerte.map((offerta) => (
        <div
          key={offerta.id}
          style={{
            border: '1px solid #ddd',
            padding: '16px',
            marginBottom: '12px',
            borderRadius: '8px'
          }}
        >
          <h3>{offerta.nome}</h3>
          <p>Fornitore: {offerta.fornitore}</p>
          <p>Tipo: {offerta.tipo}</p>
          <p>Tipologia: {offerta.tipologia}</p>
        </div>
      ))}
    </div>
  )
}

export default App