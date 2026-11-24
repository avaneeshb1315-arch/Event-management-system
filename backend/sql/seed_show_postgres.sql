CREATE TABLE IF NOT EXISTS shows (
    id         UUID PRIMARY KEY,
    venue_id   UUID NOT NULL,
    title      VARCHAR(200) NOT NULL,
    show_time  TIMESTAMP NOT NULL,
    status     VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

DO $$
DECLARE
    v_show  UUID := gen_random_uuid();
    v_venue UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM shows) THEN
        RAISE NOTICE 'Seed skipped: shows already has data';
        RETURN;
    END IF;

    SELECT venue_id INTO v_venue FROM seat_blocks LIMIT 1;

    INSERT INTO shows (id, venue_id, title, show_time)
    VALUES (v_show, v_venue, 'Test Show', NOW() + INTERVAL '7 days');

    INSERT INTO show_seats (id, show_id, seat_id, status, price_tier, price)
    SELECT gen_random_uuid(), v_show, s.id, 'AVAILABLE',
           CASE b.name WHEN 'VIP' THEN 'VIP' WHEN 'PT' THEN 'PT'
                       WHEN 'G' THEN 'G' ELSE 'STANDARD' END,
           CASE b.name WHEN 'VIP' THEN 1500 WHEN 'PT' THEN 1000
                       WHEN 'G' THEN 700 ELSE 500 END
    FROM seats s
    JOIN seat_blocks b ON b.id = s.block_id;

    RAISE NOTICE 'Show id: %', v_show;
END $$;

SELECT s.id AS show_id, s.title, COUNT(ss.id) AS seats
FROM shows s
LEFT JOIN show_seats ss ON ss.show_id = s.id
GROUP BY s.id, s.title;