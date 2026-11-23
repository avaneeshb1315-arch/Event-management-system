-- Seed: Main Civic Auditorium (matches Figma SEATING FINAL)
DO $$
DECLARE
    v_venue UUID := gen_random_uuid();
    v_vip   UUID := gen_random_uuid();
    v_pt    UUID := gen_random_uuid();
    v_g     UUID := gen_random_uuid();
    v_hall  UUID := gen_random_uuid();
BEGIN
    IF EXISTS (SELECT 1 FROM seat_blocks) THEN
        RAISE NOTICE 'Seed skipped: seat_blocks already has data';
        RETURN;
    END IF;

    INSERT INTO seat_blocks (id, venue_id, name, block_type, capacity, sort_order) VALUES
        (v_vip,  v_venue, 'VIP',       'GRID', 12,  1),
        (v_pt,   v_venue, 'PT',        'GRID', 24,  2),
        (v_g,    v_venue, 'G',         'GRID', 24,  3),
        (v_hall, v_venue, 'Main Hall', 'GRID', 200, 4);

    INSERT INTO seats (id, block_id, row_label, seat_number, table_number)
    SELECT gen_random_uuid(), v_vip, 'VIP', n, NULL FROM generate_series(1, 12) AS n;

    INSERT INTO seats (id, block_id, row_label, seat_number, table_number)
    SELECT gen_random_uuid(), v_pt, 'PT', n, NULL FROM generate_series(1, 24) AS n;

    INSERT INTO seats (id, block_id, row_label, seat_number, table_number)
    SELECT gen_random_uuid(), v_g, 'G', n, NULL FROM generate_series(1, 24) AS n;

    INSERT INTO seats (id, block_id, row_label, seat_number, table_number)
    SELECT gen_random_uuid(), v_hall, r.l, s.n, NULL
    FROM unnest(ARRAY['A','B','C','D','E','F','G','H','I','J']) AS r(l)
    CROSS JOIN generate_series(1, 20) AS s(n);

    RAISE NOTICE 'Seed done. Venue id: %', v_venue;
END $$;

SELECT b.name, b.capacity, COUNT(s.id) AS seats_created
FROM seat_blocks b
LEFT JOIN seats s ON s.block_id = b.id
GROUP BY b.name, b.capacity, b.sort_order
ORDER BY b.sort_order;