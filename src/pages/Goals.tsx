import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Financial Goals</h2>
      
      <div className="bg-white p-6 border rounded shadow-sm mb-8">
        <h3 className="text-xl font-bold mb-4">Set a New Goal</h3>
        <form onSubmit={handleAddGoal} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-bold">Goal Name</label>
            <input type="text" className="w-full border p-2 rounded" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Vacation Fund" />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-bold">Target Amount ($)</label>
            <input type="number" step="0.01" className="w-full border p-2 rounded" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-bold">Deadline (Optional)</label>
            <input type="date" className="w-full border p-2 rounded" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">Add</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal: any) => {
          const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          return (
            <div key={goal.id} className="bg-white p-6 border rounded shadow-sm relative">
              <button onClick={() => handleDelete(goal.id)} className="absolute top-4 right-4 text-red-500 text-sm hover:underline">Delete</button>
              <h3 className="text-xl font-bold mb-2">{goal.name}</h3>
              <p className="text-gray-600 mb-4">
                Saved: <span className="font-bold text-green-600">${goal.current_amount}</span> / ${goal.target_amount}
                {goal.deadline && <span className="ml-2 text-sm text-gray-400">Due: {new Date(goal.deadline).toLocaleDateString()}</span>}
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              
              <button onClick={() => handleAddFunds(goal.id, Number(goal.current_amount))} className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border">
                + Add Funds
              </button>
            </div>
          );
        })}
        {goals.length === 0 && <p className="text-gray-500">No active goals found. Set one above!</p>}
      </div>
    </div>
  );
};

export default Goals;
