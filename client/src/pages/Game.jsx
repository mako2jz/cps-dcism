import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, MousePointer2, Sparkles, TreeDeciduous, Medal, Crown, Gem, Flame, AlertTriangle, Ban } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

// Tier definitions
const TIERS = [
  { tier: 0, name: 'Steve', minCps: 0, maxCps: 4, color: '#8B7355', bgColor: 'bg-amber-900/20', borderColor: 'border-amber-800', description: 'Everyone starts somewhere.' },
  { tier: 1, name: 'BajanCanadian', minCps: 5, maxCps: 7, color: '#CD7F32', bgColor: 'bg-orange-900/20', borderColor: 'border-orange-700', description: 'Solid, clean, classic.' },
  { tier: 2, name: 'PrestonPlayz', minCps: 8, maxCps: 10, color: '#C0C0C0', bgColor: 'bg-slate-400/20', borderColor: 'border-slate-400', description: 'Consistent and energetic.' },
  { tier: 3, name: 'Technoblade', minCps: 11, maxCps: 13, color: '#FFD700', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500', description: 'Precision beats raw speed.' },
  { tier: 4, name: 'Stimpy', minCps: 14, maxCps: 16, color: '#00CED1', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-400', description: 'Mechanical excellence.' },
  { tier: 5, name: 'Huahwi', minCps: 17, maxCps: 18, color: '#FF6B35', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500', description: 'Elite tournament tier.' },
  { tier: 6, name: 'Fruitberries', minCps: 19, maxCps: 22, color: '#FF4444', bgColor: 'bg-red-500/20', borderColor: 'border-red-500', description: 'Borderline unreal.' },
  { tier: 7, name: 'Herobrine', minCps: 23, maxCps: Infinity, color: '#8B0000', bgColor: 'bg-red-900/30', borderColor: 'border-red-800', description: 'Not human. Flagged.' },
];

const getTierIcon = (tier, size = 'w-6 h-6') => {
  const icons = {
    0: <TreeDeciduous className={size} />,
    1: <Medal className={size} />,
    2: <Medal className={size} />,
    3: <Crown className={size} />,
    4: <Gem className={size} />,
    5: <Flame className={size} />,
    6: <AlertTriangle className={size} />,
    7: <Ban className={size} />,
  };
  return icons[tier] || icons[0];
};

const getTierByCps = (cps) => {
  if (cps >= 23) return TIERS[7];
  if (cps >= 19) return TIERS[6];
  if (cps >= 17) return TIERS[5];
  if (cps >= 14) return TIERS[4];
  if (cps >= 11) return TIERS[3];
  if (cps >= 8) return TIERS[2];
  if (cps >= 5) return TIERS[1];
  return TIERS[0];
};

function Game() {
  const { user, isAuthenticated, logout } = useAuth();

  // Game state
  const [gameState, setGameState] = useState('idle'); // idle, playing, finished
  const [duration, setDuration] = useState(10000);
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [cps, setCps] = useState(0);
  const [liveCps, setLiveCps] = useState(0);
  const [bestCps, setBestCps] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const timerRef = useRef(null);
  const gameAreaRef = useRef(null);

  const durations = [
    { value: 1000, label: '1s' },
    { value: 5000, label: '5s' },
    { value: 10000, label: '10s' },
    { value: 30000, label: '30s' },
    { value: 60000, label: '60s' },
  ];

  // Fetch user stats on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/game/stats');
      setStats(response.data);
      setBestCps(response.data.best_cps || 0);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = duration - elapsed;

        // Calculate live CPS
        const elapsedSeconds = elapsed / 1000;
        if (elapsedSeconds > 0) {
          setLiveCps(clicks / elapsedSeconds);
        }

        if (remaining <= 0) {
          // Game over
          clearInterval(timerRef.current);
          setTimeLeft(0);
          setGameState('finished');
          setEndTime(new Date().toISOString());
        } else {
          setTimeLeft(remaining);
        }
      }, 10);

      return () => clearInterval(timerRef.current);
    }
  }, [gameState, startTime, duration, clicks]);

  // Calculate CPS when game finishes
  useEffect(() => {
    if (gameState === 'finished') {
      const calculatedCps = clicks / (duration / 1000);
      setCps(calculatedCps);

      // Submit to server if authenticated
      if (isAuthenticated) {
        submitResult(calculatedCps);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const submitResult = async (calculatedCps) => {
    setSubmitting(true);
    setError('');

    try {
      await api.post('/game/submit', {
        duration_ms: duration,
        total_clicks: clicks,
        cps: calculatedCps.toFixed(2),
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        browser: navigator.userAgent.split(' ').pop(),
        user_agent: navigator.userAgent,
        started_at: new Date(startTime).toISOString(),
        ended_at: endTime || new Date().toISOString(),
      });

      // Update best CPS if this is a new record
      if (calculatedCps > bestCps) {
        setBestCps(calculatedCps);
      }

      // Refresh stats
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const startGame = useCallback(() => {
    setGameState('playing');
    setClicks(0);
    setTimeLeft(duration);
    setStartTime(Date.now());
    setEndTime(null);
    setCps(0);
    setLiveCps(0);
    setError('');
    
    // Focus the game area
    gameAreaRef.current?.focus();
  }, [duration]);

  const handleClick = useCallback(() => {
    if (gameState === 'playing') {
      setClicks((prev) => prev + 1);
    } else if (gameState === 'idle') {
      startGame();
    }
  }, [gameState, startGame]);

  const resetGame = () => {
    setGameState('idle');
    setClicks(0);
    setTimeLeft(duration);
    setCps(0);
    setLiveCps(0);
    setError('');
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  return (
    <div className="min-h-screen bg-cps-bg p-4 md:p-8">
      {/* Navigation */}
      <nav className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-2xl font-bold text-cps-primary">CPS Test</h1>
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/leaderboard">
            <Button variant="outline" className="border-cps-border text-cps-text hover:bg-cps-card-hover">
              <Trophy className="w-4 h-4 mr-2" /> Leaderboard
            </Button>
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-cps-text">{user?.username}</span>
              <Button
                variant="ghost"
                onClick={logout}
                className="text-cps-text-muted hover:text-red-400"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-cps-primary hover:bg-cps-primary-alt text-cps-bg">
                Login
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Duration Selector */}
        {gameState === 'idle' && (
          <Card className="bg-cps-card border-cps-border">
            <CardContent className="p-6">
              <h3 className="text-cps-text-muted text-sm mb-3">Select Duration</h3>
              <div className="flex gap-2 flex-wrap">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => {
                      setDuration(d.value);
                      setTimeLeft(d.value);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      duration === d.value
                        ? 'bg-cps-primary text-cps-bg'
                        : 'bg-cps-bg text-cps-text-muted hover:text-cps-text border border-cps-border'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Game Area */}
        <Card className="bg-cps-card border-cps-border overflow-hidden">
          {/* Progress Bar */}
          {gameState === 'playing' && (
            <div className="h-2 bg-cps-bg">
              <div
                className="h-full bg-cps-primary transition-all duration-100"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          )}

          <CardContent className="p-0">
            {/* Click Area */}
            <div
              ref={gameAreaRef}
              tabIndex={0}
              onClick={handleClick}
              className={`relative select-none min-h-[400px] flex flex-col items-center justify-center
                        transition-colors focus:outline-none focus:ring-4 focus:ring-cps-primary/50 ${
                          gameState === 'playing'
                            ? 'cursor-pointer bg-cps-card-hover active:bg-cps-primary/20'
                            : gameState === 'idle'
                              ? 'cursor-pointer hover:bg-cps-card-hover'
                              : 'cursor-default'
                        }`}
            >
              {gameState === 'idle' && (
                <div className="text-center space-y-4">
                  <div className="mb-6"><MousePointer2 className="w-16 h-16 mx-auto text-cps-primary" /></div>
                  <h2 className="text-3xl font-bold text-cps-text">
                    Click to Start
                  </h2>
                  <p className="text-cps-text-muted">
                    Click as fast as you can for {duration / 1000} seconds
                  </p>
                  {!isAuthenticated && (
                    <p className="text-sm text-cps-text-muted mt-4">
                      <Link to="/login" className="text-cps-primary hover:underline">
                        Login
                      </Link>{' '}
                      to save your scores
                    </p>
                  )}
                </div>
              )}

              {gameState === 'playing' && (
                <div className="text-center space-y-6">
                  <div className="text-7xl font-mono font-bold text-cps-primary">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-6xl font-bold text-cps-text">
                    {clicks}
                  </div>
                  <p className="text-cps-text-muted">clicks</p>
                </div>
              )}

              {gameState === 'finished' && (
                <div className="text-center space-y-6">
                  <div className="text-2xl text-cps-text-muted">Your CPS</div>
                  <div className="text-7xl font-mono font-bold text-cps-primary">
                    {cps.toFixed(2)}
                  </div>
                  <div className="text-cps-text-muted">
                    {clicks} clicks in {duration / 1000}s
                  </div>
                  
                  {submitting && (
                    <p className="text-cps-text-muted animate-pulse">
                      Saving score...
                    </p>
                  )}
                  
                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  {cps > bestCps && bestCps > 0 && (
                    <div className="bg-cps-primary/20 text-cps-primary px-4 py-2 rounded-lg inline-flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> New Personal Best!
                    </div>
                  )}

                  <div className="flex gap-4 justify-center mt-6">
                    <Button
                      onClick={startGame}
                      className="bg-cps-primary hover:bg-cps-primary-alt text-cps-bg px-8"
                    >
                      Play Again
                    </Button>
                    <Button
                      onClick={resetGame}
                      variant="outline"
                      className="border-cps-border text-cps-text hover:bg-cps-card-hover"
                    >
                      Change Duration
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Tier Display */}
        {(gameState === 'playing' || gameState === 'finished') && (
          <Card className={`border ${getTierByCps(gameState === 'playing' ? liveCps : cps).borderColor} ${getTierByCps(gameState === 'playing' ? liveCps : cps).bgColor}`}>
            <CardContent className="p-6">
              {(() => {
                const currentCps = gameState === 'playing' ? liveCps : cps;
                const tier = getTierByCps(currentCps);
                return (
                  <div className="flex items-center gap-4">
                    {/* Tier Icon */}
                    <div 
                      className="p-3 rounded-xl" 
                      style={{ backgroundColor: `${tier.color}20` }}
                    >
                      <div style={{ color: tier.color }}>
                        {getTierIcon(tier.tier, 'w-8 h-8')}
                      </div>
                    </div>
                    
                    {/* Tier Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-cps-text-muted text-sm">Tier {tier.tier}</span>
                        <h3 
                          className="text-xl font-bold font-display"
                          style={{ color: tier.color }}
                        >
                          {tier.name}
                        </h3>
                      </div>
                      <p className="text-cps-text-muted text-sm">{tier.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-cps-text-muted">CPS Range:</span>
                        <span 
                          className="text-xs font-mono font-semibold"
                          style={{ color: tier.color }}
                        >
                          {tier.tier === 7 ? '23+' : `${tier.minCps}–${tier.maxCps}`}
                        </span>
                        <span className="text-cps-text-muted mx-2">•</span>
                        <span className="text-xs text-cps-text-muted">Current:</span>
                        <span 
                          className="text-xs font-mono font-semibold"
                          style={{ color: tier.color }}
                        >
                          {currentCps.toFixed(2)} CPS
                        </span>
                      </div>
                    </div>

                    {/* Live indicator for playing state */}
                    {gameState === 'playing' && (
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cps-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cps-primary"></span>
                        </span>
                        <span className="text-xs text-cps-text-muted uppercase tracking-wide">Live</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Stats Card */}
        {isAuthenticated && stats && (
          <Card className="bg-cps-card border-cps-border">
            <CardContent className="p-6">
              <h3 className="text-cps-text font-semibold mb-4">Your Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-mono font-bold text-cps-primary">
                    {stats.best_cps?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-cps-text-muted text-sm">Best CPS</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-bold text-cps-text">
                    {stats.avg_cps?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-cps-text-muted text-sm">Average CPS</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-bold text-cps-text">
                    {stats.total_tests || 0}
                  </div>
                  <div className="text-cps-text-muted text-sm">Total Tests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-cps-card border-cps-border">
          <CardContent className="p-6">
            <h3 className="text-cps-text font-semibold mb-3">How to Play</h3>
            <ul className="text-cps-text-muted space-y-2 text-sm">
              <li>• Click or tap the game area as fast as possible</li>
              <li>• Your CPS (Clicks Per Second) will be calculated at the end</li>
              <li>• Login to save your scores and compete on the leaderboard</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Game;
