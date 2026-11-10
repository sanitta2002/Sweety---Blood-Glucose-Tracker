CREATE TABLE readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    reading_date DATE NOT NULL,

    slot VARCHAR(30) NOT NULL CHECK (
        slot IN (
            'MORNING',
            'AFTER_BREAKFAST',
            'AFTER_LUNCH',
            'AFTER_DINNER'
        )
    ),

    value INTEGER NOT NULL CHECK (value BETWEEN 40 AND 600),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, reading_date, slot)
);

CREATE INDEX idx_readings_user_date
ON readings(user_id, reading_date);