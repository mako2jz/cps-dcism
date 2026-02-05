import React, { useState } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

function Home() {
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setFormData({ username: '', password: '' });
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h1>MySQL + Express + React + Node Boilerplate</h1>

      {error && <div className="error">{error}</div>}

      <Card className="user-card" style={{ marginBottom: '20px' }}>
        <h3>Add New User</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="btn btn-primary">
            Add User
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Home;
