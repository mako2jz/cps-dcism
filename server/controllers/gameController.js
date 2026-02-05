import db from '../config/db.js';

/**
 * Submit a click test result
 * POST /api/game/submit
 */
export const submitClickTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { duration_ms, total_clicks, cps, device_type, browser, user_agent, started_at, ended_at } = req.body;

    // Validate required fields
    if (!duration_ms || !total_clicks || !cps || !started_at || !ended_at) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Basic anti-cheat: CPS validation
    const calculatedCps = (total_clicks / (duration_ms / 1000)).toFixed(2);
    const difference = Math.abs(parseFloat(cps) - parseFloat(calculatedCps));
    
    // Flag if reported CPS differs significantly from calculated
    let is_valid = true;
    let flagReason = null;

    if (difference > 0.5) {
      is_valid = false;
      flagReason = 'CLIENT_TAMPERING';
    }

    // Flag impossibly high CPS (world record is ~14.1 CPS)
    if (parseFloat(cps) > 20) {
      is_valid = false;
      flagReason = 'IMPOSSIBLE_CPS';
    }

    // Insert click test
    const [result] = await db.query(
      `INSERT INTO click_tests 
       (user_id, duration_ms, total_clicks, cps, device_type, browser, user_agent, started_at, ended_at, is_valid)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, duration_ms, total_clicks, cps, device_type || null, browser || null, user_agent || null, started_at, ended_at, is_valid]
    );

    const clickTestId = result.insertId;

    // Flag if invalid
    if (!is_valid && flagReason) {
      await db.query(
        'INSERT INTO flagged_tests (click_test_id, reason) VALUES (?, ?)',
        [clickTestId, flagReason]
      );
    }

    // Update user_stats
    await updateUserStats(userId);

    res.status(201).json({
      id: clickTestId,
      cps: parseFloat(cps),
      total_clicks,
      duration_ms,
      is_valid
    });

  } catch (error) {
    console.error('Submit click test error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Helper: Update user_stats table
 */
const updateUserStats = async (userId) => {
  const [stats] = await db.query(
    `SELECT 
       MAX(cps) as best_cps,
       AVG(cps) as avg_cps,
       COUNT(*) as total_tests
     FROM click_tests 
     WHERE user_id = ? AND is_valid = true`,
    [userId]
  );

  const { best_cps, avg_cps, total_tests } = stats[0];

  // Upsert user_stats
  await db.query(
    `INSERT INTO user_stats (user_id, best_cps, avg_cps, total_tests)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       best_cps = VALUES(best_cps),
       avg_cps = VALUES(avg_cps),
       total_tests = VALUES(total_tests)`,
    [userId, best_cps || 0, avg_cps || 0, total_tests || 0]
  );
};

/**
 * Get leaderboard
 * GET /api/game/leaderboard
 * Query params: duration (default 10000), limit (default 100)
 */
export const getLeaderboard = async (req, res) => {
  try {
    const duration = parseInt(req.query.duration) || 10000;
    const limit = Math.min(parseInt(req.query.limit) || 100, 100);

    const [rows] = await db.query(
      `SELECT 
         u.id as user_id,
         u.username,
         MAX(ct.cps) AS best_cps,
         COUNT(ct.id) AS total_tests
       FROM click_tests ct
       JOIN users u ON ct.user_id = u.id
       WHERE ct.is_valid = true
         AND ct.duration_ms = ?
         AND u.is_banned = false
       GROUP BY u.id, u.username
       ORDER BY best_cps DESC
       LIMIT ?`,
      [duration, limit]
    );

    // Add rank to each entry
    const leaderboard = rows.map((row, index) => ({
      rank: index + 1,
      ...row,
      best_cps: parseFloat(row.best_cps)
    }));

    res.json(leaderboard);

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's personal stats
 * GET /api/game/stats
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await db.query(
      `SELECT 
         us.best_cps,
         us.avg_cps,
         us.total_tests,
         us.updated_at
       FROM user_stats us
       WHERE us.user_id = ?`,
      [userId]
    );

    if (stats.length === 0) {
      return res.json({
        best_cps: 0,
        avg_cps: 0,
        total_tests: 0,
        updated_at: null
      });
    }

    res.json({
      best_cps: parseFloat(stats[0].best_cps) || 0,
      avg_cps: parseFloat(stats[0].avg_cps) || 0,
      total_tests: stats[0].total_tests || 0,
      updated_at: stats[0].updated_at
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get user's recent tests
 * GET /api/game/history
 */
export const getTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    const [rows] = await db.query(
      `SELECT 
         id,
         duration_ms,
         total_clicks,
         cps,
         started_at,
         ended_at,
         is_valid
       FROM click_tests
       WHERE user_id = ?
       ORDER BY started_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    res.json(rows.map(row => ({
      ...row,
      cps: parseFloat(row.cps)
    })));

  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({ error: error.message });
  }
};
