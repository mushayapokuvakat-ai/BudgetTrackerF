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
      const res = await fetch('http://localhost:5000/api/expenses', {
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
      await fetch('http://localhost:5000/api/expenses', {
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
      await fetch(`http://localhost:5000/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      fetchExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Expense Tracking</h2>
      
      <div className="bg-white p-6 border rounded shadow-sm mb-8">
        <h3 className="text-xl font-bold mb-4">Add Expense</h3>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block mb-1">Amount ($)</label>
            <input type="number" required className="border p-2 rounded w-32" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Category</label>
            <select className="border p-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
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
          <div>
            <label className="block mb-1">Description</label>
            <input type="text" className="border p-2 rounded" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Date</label>
            <input type="date" required className="border p-2 rounded" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} />
          </div>
          <button type="submit" className="bg-blue-600 text-white p-2 px-4 rounded hover:bg-blue-700">Add</button>
        </form>
      </div>

      <div className="bg-white p-6 border rounded shadow-sm">
        <h3 className="text-xl font-bold mb-4">Expense History</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Category</th>
              <th className="py-2">Description</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp: any) => (
              <tr key={exp.id} className="border-b">
                <td className="py-2">{new Date(exp.expense_date).toLocaleDateString()}</td>
                <td className="py-2">{exp.category}</td>
                <td className="py-2">{exp.description}</td>
                <td className="py-2 font-bold text-red-600">${Number(exp.amount).toFixed(2)}</td>
                <td className="py-2">
                  <button onClick={() => handleDelete(exp.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No expense records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
