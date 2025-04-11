DO $$
BEGIN
    -- Crear el tipo ENUM si no existe
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'board_member_status') THEN
        CREATE TYPE board_member_status AS ENUM ('active', 'inactive');
    END IF;
END$$;

-- Agregar columna status si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'board_members'
        AND column_name = 'status'
    ) THEN
        ALTER TABLE board_members
        ADD COLUMN status board_member_status NOT NULL DEFAULT 'active';
    END IF;
END$$; 