-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    sleep_start TIME NOT NULL DEFAULT '22:00',
    sleep_end TIME NOT NULL DEFAULT '06:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create drinks table
CREATE TABLE IF NOT EXISTS drinks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    caffeine_amount INTEGER NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    user_id INTEGER REFERENCES users(id),
    color VARCHAR(7) DEFAULT '#000000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create intakes table
CREATE TABLE IF NOT EXISTS intakes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    drink_id INTEGER REFERENCES drinks(id) NOT NULL,
    amount INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user
INSERT INTO users (id, sleep_start, sleep_end)
VALUES (1, '22:00', '06:00')
ON CONFLICT (id) DO NOTHING;

-- Insert default drinks
INSERT INTO drinks (name, caffeine_amount, is_custom, color) VALUES
    ('Coffee (8 oz)', 95, false, '#6F4E37'),
    ('Espresso Shot', 63, false, '#3C2F2F'),
    ('Black Tea', 47, false, '#B22222'),
    ('Green Tea', 28, false, '#90EE90'),
    ('Cola (12 oz)', 34, false, '#8B4513'),
    ('Energy Drink (8 oz)', 80, false, '#FFD700'),
    ('Cold Brew Coffee', 100, false, '#483C32'),
    ('Matcha Green Tea', 70, false, '#90EE90')
ON CONFLICT DO NOTHING;

-- Insert sample intakes for the default user
INSERT INTO intakes (user_id, drink_id, amount, timestamp) VALUES
    (1, 1, 95, NOW() - INTERVAL '4 HOURS'),
    (1, 6, 80, NOW() - INTERVAL '8 HOURS'),
    (1, 3, 47, NOW() - INTERVAL '12 HOURS')
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_intakes_user_id ON intakes(user_id);
CREATE INDEX IF NOT EXISTS idx_intakes_drink_id ON intakes(drink_id);
CREATE INDEX IF NOT EXISTS idx_intakes_timestamp ON intakes(timestamp);
CREATE INDEX IF NOT EXISTS idx_drinks_user_id ON drinks(user_id);
