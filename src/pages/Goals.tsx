import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

const CircularProgress = ({ progress, color }: { progress: number, color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-muted"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const Goals = () => {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchGoals = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/goals`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setGoals(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ name, target_amount: Number(targetAmount), deadline })
      });
      setName('');
      setTargetAmount('');
      setDeadline('');
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFunds = async (id: string, currentAmount: number) => {
    const amountStr = window.prompt('Enter amount to add to this goal:');
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/goals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ current_amount: currentAmount + amount })
      });
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/goals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      fetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Personalized Spending Jars</h2>
        <p className="text-xl text-muted-foreground">Manage your budgets and goals intuitively.</p>
      </header>
      
      <div className="bg-card p-6 md:p-8 border border-border rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-6 tracking-wide text-primary">Add New Jar</h3>
        <form onSubmit={handleAddGoal} className="flex flex-col md:flex-row flex-wrap gap-6 items-end">
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Jar Name</label>
            <input 
              type="text" 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="e.g. Vacation Fund" 
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Target Amount ($)</label>
            <input 
              type="number" 
              step="0.01" 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={targetAmount} 
              onChange={e => setTargetAmount(e.target.value)} 
              required 
              placeholder="0.00"
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto flex-1">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Deadline (Optional)</label>
            <input 
              type="date" 
              className="bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground w-full" 
              value={deadline} 
              onChange={e => setDeadline(e.target.value)} 
            />
          </div>
          <button type="submit" className="w-full md:w-auto bg-primary text-primary-foreground font-bold p-3 px-8 rounded-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg">
            Create Jar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {goals.map((goal: any, index: number) => {
          const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          const color = colors[index % colors.length];
          return (
            <div key={goal.id} className="bg-card p-6 border border-border rounded-xl shadow-lg relative group transition-all hover:scale-[1.05] flex flex-col items-center text-center">
              <button 
                onClick={() => handleDelete(goal.id)} 
                className="absolute top-2 right-3 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 font-bold text-lg"
                title="Delete Jar"
              >
                ×
              </button>
              
              <CircularProgress progress={progress} color={color} />
              
              <h3 className="text-lg font-bold mb-1 tracking-tight text-foreground">{goal.name}</h3>
              
              <div className="flex items-end gap-1 mb-4 text-sm font-bold text-muted-foreground">
                <span className="text-foreground">${goal.current_amount}</span>
                <span>/ ${goal.target_amount}</span>
              </div>
              
              <button 
                onClick={() => handleAddFunds(goal.id, Number(goal.current_amount))} 
                className="w-full bg-background border border-border text-foreground hover:border-primary hover:text-primary font-bold py-2 px-4 rounded-lg transition-all text-sm shadow-sm"
              >
                Add Funds
              </button>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl">
             <p className="text-muted-foreground font-bold tracking-wide">No active jars found. Create one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
