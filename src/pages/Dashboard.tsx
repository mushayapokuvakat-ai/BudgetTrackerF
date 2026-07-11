import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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
          savings: Math.max(0, totalIncome - totalExpenses)
        });
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const mockCategoryData = [
    { name: 'Housing', value: 800, color: '#3b82f6' },
    { name: 'Food', value: 400, color: '#10b981' },
    { name: 'Transport', value: 200, color: '#f59e0b' },
    { name: 'Entertainment', value: 150, color: '#8b5cf6' },
  ];

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-xl font-bold animate-pulse text-primary">Loading your financial data...</div>
    </div>
  );

  const balance = stats.income - stats.expenses;

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Good Morning,<br/>{user?.fullname} 👋</h2>
        <p className="text-xl text-muted-foreground">Let's grow your money today.</p>
      </header>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 border border-border rounded-xl shadow-lg hover:scale-[1.03] transition-transform duration-300">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Today's Balance</h3>
          <p className="text-3xl font-bold text-foreground mb-1">${balance.toFixed(2)}</p>
          <p className="text-sm text-green-500 font-bold tracking-wide">↑ 8% from last month</p>
        </div>
        
        <div className="bg-card p-6 border border-border rounded-xl shadow-lg hover:scale-[1.03] transition-transform duration-300">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Monthly Income</h3>
          <p className="text-3xl font-bold text-primary mb-2">${stats.income.toFixed(2)}</p>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="bg-card p-6 border border-border rounded-xl shadow-lg hover:scale-[1.03] transition-transform duration-300">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Monthly Spending</h3>
          <p className="text-3xl font-bold text-destructive mb-2">${stats.expenses.toFixed(2)}</p>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-destructive h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>

        <div className="bg-card p-6 border border-border rounded-xl shadow-lg hover:scale-[1.03] transition-transform duration-300">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Savings</h3>
          <p className="text-3xl font-bold text-green-500 mb-2">${stats.savings.toFixed(2)}</p>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-card p-6 border border-border rounded-xl shadow-lg flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold mb-2 tracking-wide self-start w-full">Track Spending Easily</h3>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontWeight: 'bold' }} 
                  itemStyle={{ color: 'hsl(var(--foreground))' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-2">
              <span className="text-sm text-muted-foreground font-bold uppercase tracking-wide">Total</span>
              <span className="text-xl font-bold text-foreground">
                ${mockCategoryData.reduce((acc, curr) => acc + curr.value, 0).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="w-full mt-4 flex flex-col gap-3">
            {mockCategoryData.map((item, i) => {
              const max = Math.max(...mockCategoryData.map(d => d.value));
              const percent = (item.value / max) * 100;
              return (
                <div key={i} className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-foreground">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground">${item.value.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Tip & Budget Health */}
        <div className="flex flex-col gap-6">
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">AI Tip</h3>
            <p className="text-foreground leading-relaxed">
              You spent 18% more on food this week. Reducing restaurant visits by two meals could save approximately <span className="font-bold text-primary">$42</span> this month.
            </p>
          </div>
          
          <div className="bg-card p-6 border border-border rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Budget Health</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-green-500">87</span>
              <span className="text-xl text-muted-foreground mb-1">/ 100</span>
            </div>
            <p className="text-sm font-bold text-green-500 tracking-wide">Excellent</p>
          </div>

          <div className="bg-card p-6 border border-border rounded-xl shadow-lg">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Upcoming Bills</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <div>
                  <p className="font-bold text-foreground">Netflix</p>
                  <p className="text-xs text-muted-foreground tracking-wide">Tomorrow</p>
                </div>
                <p className="font-bold text-destructive">-$15.00</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground">Electricity</p>
                  <p className="text-xs text-muted-foreground tracking-wide">Friday</p>
                </div>
                <p className="font-bold text-destructive">-$40.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
