-- Local integration database only. Run after the team's existing table and seed scripts.
-- The main Spring Boot backend also maps an Event entity, separate from the shows table.
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    venue VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    total_seats INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    ticket_price NUMERIC(10,2) NOT NULL
);
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;
