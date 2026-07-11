import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';

const Income = () => {
  const { user } = useAuthStore();
  const [incomes, setIncomes] = useState([]);
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');
  const [frequency, setFrequency] = useState('Monthly');
  const [dateReceived, setDateReceived] = useState('');

  const fetchIncomes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/income`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setIncomes(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/income`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ amount: Number(amount), source, frequency, date_received: dateReceived })
      });
      setAmount('');
      setDateReceived('');
      fetchIncomes();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this income?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/income/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      fetchIncomes();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Income Management</h2>
        <p className="text-xl text-muted-foreground">Track and manage your revenue streams.</p>
      </header>
      
      <div className="bg-card p-6 md:p-8 border border-border rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-6 tracking-wide text-primary">Add New Income</h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row flex-wrap gap-6 items-end">
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Amount ($)</label>
            <input 
              type="number" 
              required 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Source</label>
            <select 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={source} 
              onChange={(e) => setSource(e.target.value)}
            >
              <option>Salary</option>
              <option>Business</option>
              <option>Allowance</option>
              <option>Freelancing</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Frequency</label>
            <select 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={frequency} 
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option>Monthly</option>
              <option>Weekly</option>
              <option>One-time</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Date</label>
            <input 
              type="date" 
              required 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={dateReceived} 
              onChange={(e) => setDateReceived(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full md:w-auto bg-primary text-primary-foreground font-bold p-3 px-8 rounded-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg">
            Add Income
          </button>
        </form>
      </div>

      <div className="bg-card p-6 md:p-8 border border-border rounded-xl shadow-lg overflow-x-auto">
        <h3 className="text-xl font-bold mb-6 tracking-wide">Income History</h3>
        <div className="min-w-[600px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
                <th className="py-4 px-4 font-bold">Date</th>
                <th className="py-4 px-4 font-bold">Source</th>
                <th className="py-4 px-4 font-bold">Frequency</th>
                <th className="py-4 px-4 font-bold text-right">Amount</th>
                <th className="py-4 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((inc: any, index: number) => (
                <tr key={inc.id} className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${index % 2 === 0 ? 'bg-background/50' : 'bg-transparent'}`}>
                  <td className="py-4 px-4 text-foreground">{new Date(inc.date_received).toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-bold text-foreground">{inc.source}</td>
                  <td className="py-4 px-4 text-muted-foreground">{inc.frequency}</td>
                  <td className="py-4 px-4 font-bold text-green-500 text-right">${Number(inc.amount).toFixed(2)}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => handleDelete(inc.id)} 
                      className="text-sm font-bold text-destructive hover:text-destructive-foreground hover:bg-destructive px-3 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {incomes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-bold tracking-wide">
                    No income records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Income;
