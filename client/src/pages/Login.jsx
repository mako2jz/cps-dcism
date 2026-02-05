import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/game');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
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
          <p className="text-cps-text-muted mt-2">Login to track your scores</p>
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
                placeholder="Enter your username"
              />
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
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cps-primary hover:bg-cps-primary-alt text-cps-bg font-semibold py-3 
                       rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-cps-text-muted text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-cps-primary hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
