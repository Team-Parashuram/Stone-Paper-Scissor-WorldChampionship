SELECT 
    cr.id,
    p.name as player_name,
    cr.started_at,
    cr.ended_at,
    CASE 
        WHEN cr.ended_at IS NULL THEN EXTRACT(EPOCH FROM (NOW() - cr.started_at)) / 86400
        ELSE EXTRACT(EPOCH FROM (cr.ended_at - cr.started_at)) / 86400
    END as days_calculated,
    CASE 
        WHEN cr.ended_at IS NULL THEN (EXTRACT(EPOCH FROM (NOW() - cr.started_at)) / 86400)::INTEGER
        ELSE (EXTRACT(EPOCH FROM (cr.ended_at - cr.started_at)) / 86400)::INTEGER
    END as days_integer
FROM championship_reigns cr
INNER JOIN players p ON p.id = cr.player_id
WHERE cr.deleted_at IS NULL
ORDER BY cr.started_at;
