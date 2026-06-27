import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
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
      await fetch(`http://localhost:5000/api/admin/suspend/${id}`, {
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
      await fetch(`http://localhost:5000/api/admin/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Control Portal</h2>
      
      <div className="bg-white p-6 border rounded shadow-sm">
        <h3 className="text-xl font-bold mb-4">All Users</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Role</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Joined</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 px-2">{u.fullname}</td>
                <td className="py-2 px-2">{u.email}</td>
                <td className="py-2 px-2 font-bold">{u.role}</td>
                <td className="py-2 px-2 text-sm">
                  <span className={`px-2 py-1 rounded ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-2 px-2">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-2 flex gap-4">
                  {u.status !== 'SUSPENDED' && <button onClick={() => handleSuspend(u.id)} className="text-yellow-600 hover:underline">Suspend</button>}
                  <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-gray-500">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
