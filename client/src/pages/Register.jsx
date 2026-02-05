import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';

function Register() {
  const [formData, setFormData] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.password);
      navigate('/game');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cps-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-cps-card border-cps-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-cps-primary">
            CPS Test
          </CardTitle>
          <p className="text-cps-text-muted mt-2">Create an account to compete</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-cps-text text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cps-bg border border-cps-border rounded-lg text-cps-text 
                         focus:outline-none focus:border-cps-primary focus:ring-1 focus:ring-cps-primary
                         placeholder-cps-text-muted transition-colors"
                placeholder="Choose a username"
              />
              <p className="text-cps-text-muted text-xs">
                3-32 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-cps-text text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cps-bg border border-cps-border rounded-lg text-cps-text 
                         focus:outline-none focus:border-cps-primary focus:ring-1 focus:ring-cps-primary
                         placeholder-cps-text-muted transition-colors"
                placeholder="Create a password"
              />
              <p className="text-cps-text-muted text-xs">
                Minimum 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-cps-text text-sm font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cps-bg border border-cps-border rounded-lg text-cps-text 
                         focus:outline-none focus:border-cps-primary focus:ring-1 focus:ring-cps-primary
                         placeholder-cps-text-muted transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cps-primary hover:bg-cps-primary-alt text-cps-bg font-semibold py-3 
                       rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-cps-text-muted text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-cps-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Register;
