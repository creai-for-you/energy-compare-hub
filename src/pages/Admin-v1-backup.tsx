export default function Admin() {
  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Dashboard Admin</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Offerte</h3>
          <p>37</p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h3>PDF</h3>
          <p>38</p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Commodity EE</h3>
          <p>14</p>
        </div>

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow:
              "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h3>Commodity GAS</h3>
          <p>23</p>
        </div>
      </div>
    </div>
  );
}