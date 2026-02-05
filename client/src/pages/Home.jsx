import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Trophy, BarChart3, Medal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

function Home() {
  const { isAuthenticated, user } = useAuth();
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopScores();
  }, []);

  const fetchTopScores = async () => {
    try {
      const response = await api.get('/game/leaderboard?duration=10000&limit=5');
      setTopScores(response.data);
    } catch (err) {
      console.error('Failed to fetch top scores:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cps-bg">
      {/* Navigation */}
      <nav className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-cps-primary">CPS Test</h1>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-cps-text self-center">{user?.username}</span>
              <Link to="/game">
                <Button className="bg-cps-primary hover:bg-cps-primary-alt text-cps-bg">
                  Play Now
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-cps-border text-cps-text hover:bg-cps-card-hover">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-cps-primary hover:bg-cps-primary-alt text-cps-bg">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <h2 className="text-5xl md:text-7xl font-bold text-cps-text mb-6">
          Test Your
          <span className="text-cps-primary"> Click Speed</span>
        </h2>
        <p className="text-xl text-cps-text-muted max-w-2xl mx-auto mb-10">
          Challenge yourself and compete with players worldwide. Measure your clicks per second 
          and climb the leaderboard!
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/game">
            <Button 
              size="lg" 
              className="bg-cps-primary hover:bg-cps-primary-alt text-cps-bg font-semibold px-8 py-6 text-lg"
            >
              Start Playing
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-cps-border text-cps-text hover:bg-cps-card-hover px-8 py-6 text-lg"
            >
              View Leaderboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-cps-card border-cps-border">
            <CardContent className="p-6 text-center">
              <div className="mb-4"><Zap className="w-10 h-10 mx-auto text-cps-primary" /></div>
              <h3 className="text-xl font-semibold text-cps-text mb-2">Multiple Durations</h3>
              <p className="text-cps-text-muted">
                Test your speed with 1s, 5s, 10s, 30s, or 60s challenges
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cps-card border-cps-border">
            <CardContent className="p-6 text-center">
              <div className="mb-4"><Trophy className="w-10 h-10 mx-auto text-cps-primary" /></div>
              <h3 className="text-xl font-semibold text-cps-text mb-2">Global Leaderboard</h3>
              <p className="text-cps-text-muted">
                Compete with players worldwide and see where you rank
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cps-card border-cps-border">
            <CardContent className="p-6 text-center">
              <div className="mb-4"><BarChart3 className="w-10 h-10 mx-auto text-cps-primary" /></div>
              <h3 className="text-xl font-semibold text-cps-text mb-2">Track Progress</h3>
              <p className="text-cps-text-muted">
                View your stats, history, and personal best scores
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Top Players Preview */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-cps-text text-center mb-8 flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-cps-primary" /> Top Players (10s Mode)
        </h3>
        
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cps-primary mx-auto"></div>
          </div>
        ) : topScores.length > 0 ? (
          <div className="max-w-md mx-auto space-y-3">
            {topScores.map((entry, index) => (
              <Card 
                key={entry.user_id} 
                className={`bg-cps-card border-cps-border ${
                  index === 0 ? 'ring-2 ring-yellow-500/50' : ''
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {index === 0 && <Medal className="w-5 h-5 text-yellow-400" />}
                      {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                      {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                      {index > 2 && <span className="text-sm text-cps-text-muted">#{index + 1}</span>}
                    </div>
                    <span className="text-cps-text font-medium">{entry.username}</span>
                  </div>
                  <span className="text-cps-primary font-mono font-bold">
                    {entry.best_cps.toFixed(2)} CPS
                  </span>
                </CardContent>
              </Card>
            ))}
            
            <div className="text-center pt-4">
              <Link to="/leaderboard">
                <Button variant="link" className="text-cps-primary">
                  View Full Leaderboard →
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-cps-text-muted text-center">
            No scores yet. Be the first to play!
          </p>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <Card className="bg-gradient-to-r from-cps-primary/20 to-cps-primary-alt/20 border-cps-primary/30">
          <CardContent className="p-12">
            <h3 className="text-3xl font-bold text-cps-text mb-4">
              Ready to test your speed?
            </h3>
            <p className="text-cps-text-muted mb-6">
              Join thousands of players and see how fast you can click!
            </p>
            <Link to={isAuthenticated ? "/game" : "/register"}>
              <Button 
                size="lg" 
                className="bg-cps-primary hover:bg-cps-primary-alt text-cps-bg font-semibold px-8"
              >
                {isAuthenticated ? 'Play Now' : 'Get Started Free'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 border-t border-cps-border">
        <p className="text-center text-cps-text-muted text-sm">
          CPS Test - Test your click speed and compete with others
        </p>
      </footer>
    </div>
  );
}

export default Home;
