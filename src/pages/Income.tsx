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
    <div>
      <h2 className="text-2xl font-bold mb-6">Income Management</h2>
      
      <div className="bg-white p-6 border rounded shadow-sm mb-8">
        <h3 className="text-xl font-bold mb-4">Add Income</h3>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block mb-1">Amount ($)</label>
            <input type="number" required className="border p-2 rounded w-32" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Source</label>
            <select className="border p-2 rounded" value={source} onChange={(e) => setSource(e.target.value)}>
              <option>Salary</option>
              <option>Business</option>
              <option>Allowance</option>
              <option>Freelancing</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Frequency</label>
            <select className="border p-2 rounded" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option>Monthly</option>
              <option>Weekly</option>
              <option>One-time</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Date</label>
            <input type="date" required className="border p-2 rounded" value={dateReceived} onChange={(e) => setDateReceived(e.target.value)} />
          </div>
          <button type="submit" className="bg-blue-600 text-white p-2 px-4 rounded hover:bg-blue-700">Add</button>
        </form>
      </div>

      <div className="bg-white p-6 border rounded shadow-sm">
        <h3 className="text-xl font-bold mb-4">Income History</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Source</th>
              <th className="py-2">Frequency</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((inc: any) => (
              <tr key={inc.id} className="border-b">
                <td className="py-2">{new Date(inc.date_received).toLocaleDateString()}</td>
                <td className="py-2">{inc.source}</td>
                <td className="py-2">{inc.frequency}</td>
                <td className="py-2 font-bold text-green-600">${Number(inc.amount).toFixed(2)}</td>
                <td className="py-2">
                  <button onClick={() => handleDelete(inc.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {incomes.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No income records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Income;
