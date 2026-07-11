import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Income', path: '/income' },
    { name: 'Expenses', path: '/expenses' },
    { name: 'Goals', path: '/goals' },
    { name: 'AI Advisor', path: '/ai-advisor' },
  ];

  if (user?.role === 'ADMIN') {
    navLinks.push({ name: 'Admin Portal', path: '/admin' });
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `px-4 py-2 text-sm font-bold tracking-wide transition-all duration-200 border-b-2 ${
      isActive 
        ? 'border-primary text-primary bg-primary/10' 
        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <nav className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-primary">SmartBudget</h1>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-2 items-center">
          {navLinks.map((link) => (
            <NavLink key={link.name} to={link.path} className={navLinkClass} end={link.path === '/'}>
              {link.name}
            </NavLink>
          ))}
          <span className="text-muted-foreground text-sm ml-4 px-4 border-l border-border font-bold tracking-wide">
            {user?.fullname}
          </span>
          <button 
            onClick={handleLogout} 
            className="text-sm font-bold text-destructive hover:text-destructive-foreground hover:bg-destructive px-4 py-2 rounded transition-colors border border-transparent hover:border-destructive"
          >
            Logout
          </button>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-2xl font-bold px-2 text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden flex flex-col bg-card border-b border-border p-4 gap-2 absolute w-full z-40 top-[72px] shadow-lg">
          {navLinks.map((link) => (
            <NavLink 
              key={link.name} 
              to={link.path} 
              className={navLinkClass} 
              end={link.path === '/'}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </NavLink>
          ))}
          <div className="border-t border-border mt-2 pt-4 flex justify-between items-center px-4">
             <span className="text-muted-foreground text-sm font-bold">{user?.fullname}</span>
             <button onClick={handleLogout} className="text-sm font-bold text-destructive hover:underline">Logout</button>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        <Outlet />
      </main>

      <footer className="py-8 px-6 text-center text-sm font-bold text-muted-foreground tracking-widest border-t border-border bg-card">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 mb-4">
          <span className="cursor-pointer hover:text-primary transition-colors">Privacy</span>
          <span className="cursor-pointer hover:text-primary transition-colors">Terms</span>
          <span className="cursor-pointer hover:text-primary transition-colors">Support</span>
        </div>
        <div className="opacity-75">
          ©2026 SmartBudget AI <br />
          <span className="text-xs tracking-normal font-normal">Built by Patnat Technologies</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
