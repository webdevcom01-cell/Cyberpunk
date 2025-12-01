export default function TestPage() {
  return (
    <div style={{ 
      backgroundColor: 'black', 
      color: 'lime', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '2rem',
      fontFamily: 'monospace'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅ PROJEKT RADI!</h1>
        <p>Ako vidite ovu stranicu, Next.js server je aktivan.</p>
        <p style={{ marginTop: '1rem', fontSize: '1rem', color: '#00ff88' }}>
          Idite na <a href="/" style={{ color: 'cyan', textDecoration: 'underline' }}>http://localhost:3000</a> za glavni dashboard
        </p>
      </div>
    </div>
  )
}
