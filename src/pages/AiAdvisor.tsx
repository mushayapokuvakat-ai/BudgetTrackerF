import React, { useState, useRef, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

const AiAdvisor = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: messageText }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ message: messageText })
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const suggestions = [
    "How can I save more money this month?",
    "Analyze my spending habits.",
    "What's a good budget rule for a beginner?",
    "How much should I have in my emergency fund?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-4xl mx-auto animate-in fade-in duration-700">
      <header className="mb-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2">SmartBudget AI</h2>
        <p className="text-muted-foreground">How can I help you grow your money today?</p>
      </header>
      
      <div className="flex-1 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-primary font-bold text-xl tracking-wide mb-4">Suggested Questions</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestions.map((sug, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSend(sug)}
                    className="bg-background border border-border p-4 text-left rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div 
                  className={`p-4 max-w-[80%] rounded-2xl leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted text-foreground rounded-tl-sm border border-border'
                  }`}
                >
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="p-4 max-w-[80%] rounded-2xl bg-muted text-foreground rounded-tl-sm border border-border flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-background border-t border-border">
          <form onSubmit={handleFormSubmit} className="flex gap-2 max-w-4xl mx-auto relative">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask a financial question..."
              className="flex-1 bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all py-4 px-6 rounded-full text-foreground shadow-inner pr-24"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="absolute right-2 top-2 bottom-2 bg-primary text-primary-foreground px-6 font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-muted-foreground">
            SmartBudget AI can make mistakes. Consider verifying important financial information.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAdvisor;
