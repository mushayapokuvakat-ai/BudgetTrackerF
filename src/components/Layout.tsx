import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">SmartBudget AI</h1>
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-blue-600 hover:underline">Dashboard</Link>
          <Link to="/income" className="text-blue-600 hover:underline">Income</Link>
          <Link to="/expenses" className="text-blue-600 hover:underline">Expenses</Link>
          <Link to="/goals" className="text-blue-600 hover:underline">Goals</Link>
          <Link to="/ai-advisor" className="text-purple-600 hover:underline font-bold">AI Advisor</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-blue-600 hover:underline font-bold">Admin Portal</Link>
          )}
          <span className="text-gray-600">| {user?.fullname}</span>
          <button onClick={handleLogout} className="text-red-600 hover:underline">Logout</button>
        </div>
      </nav>
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
      <footer className="py-4 text-center text-sm font-bold text-gray-500 uppercase tracking-widest border-t">
        PROUDLY SPONSORED BY PATNAT TECH 2026
      </footer>
    </div>
  );
};

export default Layout;
