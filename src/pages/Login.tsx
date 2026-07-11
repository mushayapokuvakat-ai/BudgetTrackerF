import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        login(data.data);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300">
      <div className="bg-card p-10 rounded-xl border border-border shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <h2 className="text-3xl font-bold mb-2 text-center text-primary tracking-tight">SmartBudget</h2>
        <p className="text-center text-muted-foreground mb-8">Sign in to your account</p>
        
        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 mb-6 rounded-lg text-sm text-center font-bold">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-muted-foreground tracking-wide uppercase">Password</label>
            <input 
              type="password" 
              className="w-full bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all p-3 rounded-lg text-foreground" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground font-bold p-3 rounded-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg mt-2">
            Login
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline ml-1">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
