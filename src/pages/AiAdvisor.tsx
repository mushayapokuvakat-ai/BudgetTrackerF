import React, { useState, useRef, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

type Message = {
  sender: 'user' | 'ai';
  text: string;
  transactions?: any[];
  confirmed?: boolean;
};

const AiAdvisor = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages((prev) => [...prev, { sender: 'user', text: `📎 Uploaded E-Statement: ${file.name}` }]);
    setLoading(true);

    const formData = new FormData();
    formData.append('statement', file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/upload-statement`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setMessages((prev) => [...prev, { 
          sender: 'ai', 
          text: data.data.summary || 'Here is what I found in your statement:',
          transactions: data.data.transactions,
          confirmed: false
        }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Error parsing e-statement.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Network error during upload.' }]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmTransactions = async (msgIndex: number, transactions: any[]) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/confirm-transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ transactions })
      });

      if (res.ok) {
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[msgIndex].confirmed = true;
          return newMsgs;
        });
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Transactions have been successfully saved to your records!' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Failed to save transactions.' }]);
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
        <p className="text-muted-foreground">Chat for advice, or upload an E-Statement to auto-fill transactions.</p>
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
                  className={`p-4 max-w-[85%] rounded-2xl leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-muted text-foreground rounded-tl-sm border border-border'
                  }`}
                >
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                  
                  {msg.transactions && msg.transactions.length > 0 && (
                    <div className="mt-4 bg-background border border-border rounded-xl p-4 shadow-inner text-sm">
                      <h4 className="font-bold mb-3 tracking-wide uppercase text-primary">Pending Transactions</h4>
                      <div className="max-h-60 overflow-y-auto mb-4 border border-border rounded-md custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-muted sticky top-0">
                            <tr>
                              <th className="p-2 font-bold text-muted-foreground">Date</th>
                              <th className="p-2 font-bold text-muted-foreground">Description</th>
                              <th className="p-2 font-bold text-muted-foreground text-right">Amount</th>
                              <th className="p-2 font-bold text-muted-foreground">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {msg.transactions.map((t, i) => (
                              <tr key={i} className="border-t border-border hover:bg-muted/50">
                                <td className="p-2 text-foreground whitespace-nowrap">{t.date}</td>
                                <td className="p-2 text-foreground">{t.description}</td>
                                <td className="p-2 font-bold text-right text-foreground">${Number(t.amount).toFixed(2)}</td>
                                <td className="p-2">
                                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${t.type === 'INCOME' ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'}`}>
                                    {t.type}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {!msg.confirmed ? (
                         <button 
                           onClick={() => handleConfirmTransactions(index, msg.transactions!)}
                           className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md uppercase tracking-wide text-sm"
                         >
                           Confirm & Add Transactions
                         </button>
                      ) : (
                         <div className="text-center font-bold text-green-500 uppercase tracking-wide">
                           ✓ Saved to Records
                         </div>
                      )}
                    </div>
                  )}
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
          <form onSubmit={handleFormSubmit} className="flex gap-2 max-w-4xl mx-auto relative items-center">
            
            <input 
              type="file" 
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="p-3 bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-full border border-border flex items-center justify-center disabled:opacity-50 flex-shrink-0"
              title="Upload PDF E-Statement"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>

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
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2 font-bold rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
