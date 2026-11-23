CREATE TABLE IF NOT EXISTS seat_blocks (
    id          UUID PRIMARY KEY,
    venue_id    UUID NOT NULL,
    name        VARCHAR(100) NOT NULL,
    block_type  VARCHAR(20) NOT NULL CHECK (block_type IN ('GRID','TABLE','GA')),
    capacity    INT NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seats (
    id           UUID PRIMARY KEY,
    block_id     UUID NOT NULL REFERENCES seat_blocks(id),
    row_label    VARCHAR(5),
    seat_number  INT,
    table_number INT,
    UNIQUE (block_id, row_label, table_number, seat_number)
);

CREATE TABLE IF NOT EXISTS show_seats (
    id           UUID PRIMARY KEY,
    show_id      UUID NOT NULL,
    seat_id      UUID NOT NULL REFERENCES seats(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                 CHECK (status IN ('AVAILABLE','LOCKED','RESERVED','BOOKED','DISABLED')),
    price_tier   VARCHAR(20) NOT NULL,
    price        NUMERIC(10,2) NOT NULL,
    locked_by    UUID,
    locked_until TIMESTAMP,
    UNIQUE (show_id, seat_id)
);

CREATE TABLE IF NOT EXISTS ga_inventory (
    id           UUID PRIMARY KEY,
    show_id      UUID NOT NULL,
    block_id     UUID NOT NULL REFERENCES seat_blocks(id),
    total_count  INT NOT NULL,
    locked_count INT NOT NULL DEFAULT 0,
    booked_count INT NOT NULL DEFAULT 0,
    price        NUMERIC(10,2) NOT NULL,
    UNIQUE (show_id, block_id),
    CHECK (locked_count + booked_count <= total_count)
);

CREATE INDEX IF NOT EXISTS idx_show_seats_show_status ON show_seats(show_id, status);
CREATE INDEX IF NOT EXISTS idx_show_seats_locked_until ON show_seats(locked_until) WHERE status = 'LOCKED';