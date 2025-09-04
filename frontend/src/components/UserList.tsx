import React from 'react';
import { User } from '../types/User';

interface UserListProps {
  users: User[];
  loading: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, loading }) => {
  if (loading) {
    return (
      <div className="user-list">
        <h2>Users</h2>
        <p>Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="user-list">
        <h2>Users</h2>
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h2>Users ({users.length})</h2>
      {users.map((user) => (
        <div key={user.id} className="user-item">
          <strong>{user.name}</strong>
          <br />
          <span>{user.email}</span>
        </div>
      ))}
    </div>
  );
};

export default UserList;
