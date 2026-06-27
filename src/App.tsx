import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import AiAdvisor from './pages/AiAdvisor';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, roleRequired }: { children: React.ReactNode, roleRequired?: string }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="goals" element={<Goals />} />
          <Route path="ai-advisor" element={<AiAdvisor />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute roleRequired="ADMIN"><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
