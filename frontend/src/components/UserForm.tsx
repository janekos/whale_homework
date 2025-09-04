import React, { useState } from 'react';
import { CreateUser } from '../types/User';

interface UserFormProps {
  onSubmit: (userData: CreateUser) => Promise<boolean>;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      setMessage('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const success = await onSubmit({ name: name.trim(), email: email.trim() });
    
    if (success) {
      setName('');
      setEmail('');
      setMessage('User created successfully!');
    } else {
      setMessage('Failed to create user');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="user-form">
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
        
        {message && (
          <div className={message.includes('success') ? 'success' : 'error'}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default UserForm;
