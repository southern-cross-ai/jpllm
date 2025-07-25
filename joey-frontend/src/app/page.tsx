'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Paperclip, Loader2, CheckCircle } from 'lucide-react';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: userInput }]);
    setLoading(true);
    setUserInput('');

    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_input: userInput }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    setLoading(false);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:8000/upload-doc', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setFileName(file.name);
    alert(data.message);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🧠 AI Corporate Training Assistant</h1>
        <p className="text-gray-400 mb-6">
          Upload internal training documents (e.g., policies), then ask questions or request quizzes about them.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-300">
            <Paperclip size={18} />
            <input type="file" onChange={handleFileUpload} className="hidden" />
            Upload Document
          </label>
          {fileName && (
            <span className="text-green-400 text-sm flex items-center gap-1">
              <CheckCircle size={16} /> Uploaded: {fileName}
            </span>
          )}
        </div>

        <div className="bg-gray-900 rounded-lg p-4 h-[400px] overflow-y-auto border border-gray-800 mb-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-[85%] whitespace-pre-line ${
                msg.role === 'user'
                  ? 'ml-auto bg-blue-600 text-white'
                  : 'mr-auto bg-gray-800 text-gray-200'
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="mr-auto bg-gray-800 text-gray-400 px-3 py-2 rounded-lg animate-pulse">
              Typing...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask a question or say 'Quiz me on the policy'"
            className="flex-1 px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Ask'}
          </button>
        </form>
      </div>
    </main>
  );
}
