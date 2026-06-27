import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ income: 0, expenses: 0, savings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${user?.token}` };
        const [incRes, expRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/income`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses`, { headers })
        ]);

        const incData = await incRes.json();
        const expData = await expRes.json();

        const totalIncome = (incData.data || []).reduce((acc: number, item: any) => acc + Number(item.amount), 0);
        const totalExpenses = (expData.data || []).reduce((acc: number, item: any) => acc + Number(item.amount), 0);

        setStats({
          income: totalIncome,
          expenses: totalExpenses,
          savings: 0 // Will implement actual savings fetch next
        });
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Welcome, {user?.fullname}</h2>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border rounded shadow-sm text-center">
          <h3 className="text-gray-600 text-lg">Total Income</h3>
          <p className="text-3xl font-bold text-green-600">${stats.income.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 border rounded shadow-sm text-center">
          <h3 className="text-gray-600 text-lg">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">${stats.expenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 border rounded shadow-sm text-center">
          <h3 className="text-gray-600 text-lg">Balance</h3>
          <p className="text-3xl font-bold text-blue-600">${(stats.income - stats.expenses).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-6 border rounded shadow-sm">
        <h3 className="text-xl font-bold mb-4">Financial Overview</h3>
        <p className="text-gray-600">Additional insights will appear here.</p>
      </div>
    </div>
  );
};

export default Dashboard;
