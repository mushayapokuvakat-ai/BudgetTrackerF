import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspend = async (id: string) => {
    if (!window.confirm('Suspend this user?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/suspend/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-4xl font-bold tracking-tight mb-2">Admin Control Portal</h2>
        <p className="text-xl text-muted-foreground">Manage users and monitor system health.</p>
      </header>
      
      <div className="bg-card p-6 md:p-8 border border-border rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-6 tracking-wide text-primary">All Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wide text-sm">Name</th>
                <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wide text-sm">Email</th>
                <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wide text-sm">Role</th>
                <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wide text-sm">Status</th>
                <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wide text-sm">Joined</th>
                <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wide text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-4 font-bold text-foreground">{u.fullname}</td>
                  <td className="py-4 px-4 text-muted-foreground">{u.email}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${u.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${u.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="py-4 px-4 flex justify-end gap-3">
                    {u.status !== 'SUSPENDED' && (
                      <button onClick={() => handleSuspend(u.id)} className="text-yellow-500 hover:text-yellow-400 font-bold text-sm uppercase tracking-wide transition-colors">
                        Suspend
                      </button>
                    )}
                    <button onClick={() => handleDelete(u.id)} className="text-destructive hover:text-red-400 font-bold text-sm uppercase tracking-wide transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground font-bold tracking-wide">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
