import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';

const Expenses = () => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setExpenses(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ amount: Number(amount), category, description, expense_date: expenseDate })
      });
      setAmount('');
      setDescription('');
      setExpenseDate('');
      fetchExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      fetchExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Expense Tracking</h2>
        <p className="text-xl text-muted-foreground">Monitor where your money is going.</p>
      </header>
      
      <div className="bg-card p-6 md:p-8 border border-border rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-6 tracking-wide text-primary">Add New Expense</h3>
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
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Category</label>
            <select 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Rent</option>
              <option>Utilities</option>
              <option>Education</option>
              <option>Health</option>
              <option>Entertainment</option>
              <option>Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Description</label>
            <input 
              type="text" 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Grocery shopping"
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Date</label>
            <input 
              type="date" 
              required 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={expenseDate} 
              onChange={(e) => setExpenseDate(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full md:w-auto bg-primary text-primary-foreground font-bold p-3 px-8 rounded-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg">
            Add Expense
          </button>
        </form>
      </div>

      <div className="bg-card p-6 md:p-8 border border-border rounded-xl shadow-lg overflow-x-auto">
        <h3 className="text-xl font-bold mb-6 tracking-wide">Expense History</h3>
        <div className="min-w-[600px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
                <th className="py-4 px-4 font-bold">Date</th>
                <th className="py-4 px-4 font-bold">Category</th>
                <th className="py-4 px-4 font-bold">Description</th>
                <th className="py-4 px-4 font-bold text-right">Amount</th>
                <th className="py-4 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp: any, index: number) => (
                <tr key={exp.id} className={`border-b border-border/50 hover:bg-primary/5 transition-colors ${index % 2 === 0 ? 'bg-background/50' : 'bg-transparent'}`}>
                  <td className="py-4 px-4 text-foreground">{new Date(exp.expense_date).toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-bold text-foreground">{exp.category}</td>
                  <td className="py-4 px-4 text-muted-foreground">{exp.description}</td>
                  <td className="py-4 px-4 font-bold text-destructive text-right">-${Number(exp.amount).toFixed(2)}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => handleDelete(exp.id)} 
                      className="text-sm font-bold text-destructive hover:text-destructive-foreground hover:bg-destructive px-3 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground font-bold tracking-wide">
                    No expense records found.
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

export default Expenses;
