'use client'

import { useState } from 'react'

export default function SimpleGeminiTest() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/gemini-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      setResponse(data.text || 'Sem resposta')
    } catch (error) {
      setResponse('Erro: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
        🧪 Teste Simples - Gemini Audio
      </h1>

      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Digite seu prompt aqui..."
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            minHeight: '120px',
            marginBottom: '15px',
          }}
        />

        <button
          type="submit"
          disabled={loading || !prompt}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            backgroundColor: loading ? '#ccc' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? '⏳ Gerando...' : '🚀 Gerar Resposta'}
        </button>
      </form>

      {response && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#8b5cf6' }}>
            📝 Resposta:
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {response}
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '15px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <strong>💡 Dica:</strong> Esta é uma versão minimalista sem estilização complexa.
        Para a versão completa com áudio, acesse:{' '}
        <a
          href="/gemini-audio"
          style={{ color: '#8b5cf6', textDecoration: 'underline' }}
        >
          /gemini-audio
        </a>
      </div>
    </div>
  )
}

