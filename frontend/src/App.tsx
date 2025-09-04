import React, { useState, useEffect } from 'react';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import { User, CreateUser } from './types/User';
import { fetchUsers, createUser } from './services/userService';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: CreateUser) => {
    try {
      const newUser = await createUser(userData);
      setUsers(prev => [...prev, newUser]);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to create user');
      console.error('Error creating user:', err);
      return false;
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="container">
      <h1>User Management</h1>
      
      <UserForm onSubmit={handleCreateUser} />
      
      {error && <div className="error">{error}</div>}
      
      <UserList users={users} loading={loading} />
    </div>
  );
};

export default App;
