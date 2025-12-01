export default function TestPage() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      color: 'black', 
      padding: '50px',
      fontSize: '24px',
      minHeight: '100vh'
    }}>
      <h1>TEST PAGE</h1>
      <p>If you can see this, the server is working correctly.</p>
      <p>Current time: {new Date().toISOString()}</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go to Dashboard
      </a>
    </div>
  )
}
