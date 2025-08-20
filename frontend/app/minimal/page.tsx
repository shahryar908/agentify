export default function MinimalPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ color: 'red' }}>MINIMAL TEST PAGE</h1>
      <p style={{ color: 'blue', fontSize: '18px' }}>
        If you can see this text, React rendering is working!
      </p>
      <div style={{ 
        backgroundColor: 'yellow', 
        padding: '10px', 
        margin: '10px 0',
        border: '2px solid black' 
      }}>
        This is a styled div with inline styles - no Tailwind needed
      </div>
      <button 
        onClick={() => alert('JavaScript is working!')}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Click me to test JavaScript
      </button>
    </div>
  )
}