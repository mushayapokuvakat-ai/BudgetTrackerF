import React, { useState } from 'react';
import useAuthStore from '../store/useAuthStore';

const AiAdvisor = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Error: Could not connect to AI advisor.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Network error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white border rounded shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-xl font-bold">SmartBudget AI Financial Advisor</h2>
        <p className="text-gray-600 text-sm">Ask me about your spending habits, savings advice, or budget planning.</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 max-w-[70%] rounded ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black border'}`}>
              <span className="whitespace-pre-wrap">{msg.text}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 rounded bg-gray-100 text-black border text-sm italic">Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t flex gap-2 bg-gray-50">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a financial question..."
          className="flex-1 border p-2 rounded"
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
};

export default AiAdvisor;
