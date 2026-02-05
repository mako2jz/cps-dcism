-- ================================
-- LEADERBOARD QUERY
-- ================================
SELECT
  u.username,
  MAX(ct.cps) AS best_cps
FROM click_tests ct
JOIN users u ON ct.user_id = u.id
WHERE ct.is_valid = true
  AND ct.duration_ms = 10000
GROUP BY u.username
ORDER BY best_cps DESC
LIMIT 100;