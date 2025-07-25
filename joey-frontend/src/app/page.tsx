'use client';
import { useState } from 'react';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input: userInput }),
    });
    const data = await res.json();
    setResponse(data.response);
    setLoading(false);
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Chat with JoeyLLM</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Say something..."
          style={{ width: '300px', padding: '0.5rem' }}
        />
        <button type="submit" disabled={loading} style={{ marginLeft: '1rem' }}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
      <div style={{ marginTop: '2rem' }}>
        <strong>Assistant:</strong>
        <p>{response}</p>
      </div>
    </main>
  );
}
