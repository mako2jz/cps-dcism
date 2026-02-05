import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(10000);
  const { user, isAuthenticated } = useAuth();

  const durations = [
    { value: 1000, label: '1s' },
    { value: 5000, label: '5s' },
    { value: 10000, label: '10s' },
    { value: 30000, label: '30s' },
    { value: 60000, label: '60s' },
  ];

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/game/leaderboard?duration=${duration}`);
      setLeaderboard(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-700/20 to-amber-800/10 border-amber-600/50';
      default:
        return 'bg-cps-card-hover border-cps-border';
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Medal className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-cps-text-muted">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-cps-bg p-4 md:p-8">
      {/* Navigation */}
      <nav className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-2xl font-bold text-cps-primary">CPS Test</h1>
        </Link>
        <div className="flex gap-4">
          <Link to="/game">
            <Button variant="outline" className="border-cps-border text-cps-text hover:bg-cps-card-hover">
              Play Game
            </Button>
          </Link>
          {isAuthenticated ? (
            <span className="text-cps-text-muted self-center">
              {user?.username}
            </span>
          ) : (
            <Link to="/login">
              <Button className="bg-cps-primary hover:bg-cps-primary-alt text-cps-bg">
                Login
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <Card className="max-w-4xl mx-auto bg-cps-card border-cps-border">
        <CardHeader>
          <CardTitle className="text-2xl text-cps-text flex items-center justify-between flex-wrap gap-4">
            <span className="flex items-center gap-2"><Trophy className="w-6 h-6 text-cps-primary" /> Leaderboard</span>
            
            {/* Duration Filter */}
            <div className="flex gap-2 flex-wrap">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuration(d.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    duration === d.value
                      ? 'bg-cps-primary text-cps-bg'
                      : 'bg-cps-bg text-cps-text-muted hover:text-cps-text border border-cps-border'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cps-primary mx-auto"></div>
              <p className="text-cps-text-muted mt-4">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cps-text-muted text-lg">No scores yet for this duration</p>
              <Link to="/game">
                <Button className="mt-4 bg-cps-primary hover:bg-cps-primary-alt text-cps-bg">
                  Be the first to play!
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-cps-text-muted text-sm font-medium">
                <div className="col-span-2">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-3 text-right">Best CPS</div>
                <div className="col-span-2 text-right">Tests</div>
              </div>

              {/* Entries */}
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border transition-colors ${getRankStyle(entry.rank)} ${
                    user?.id === entry.user_id ? 'ring-2 ring-cps-primary' : ''
                  }`}
                >
                  <div className="col-span-2 font-mono text-lg flex items-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-5 text-cps-text font-medium truncate">
                    {entry.username}
                    {user?.id === entry.user_id && (
                      <span className="ml-2 text-cps-primary text-xs">(You)</span>
                    )}
                  </div>
                  <div className="col-span-3 text-right font-mono text-cps-primary font-bold">
                    {entry.best_cps.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right text-cps-text-muted">
                    {entry.total_tests}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Leaderboard;
