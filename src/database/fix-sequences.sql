-- Corregir secuencia de boards
SELECT setval(
    pg_get_serial_sequence('boards', 'id'),
    COALESCE((SELECT MAX(id) FROM boards), 0) + 1,
    false
);

-- Corregir secuencia de users
SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    COALESCE((SELECT MAX(id) FROM users), 0) + 1,
    false
);

-- Corregir secuencia de lists
SELECT setval(
    pg_get_serial_sequence('lists', 'id'),
    COALESCE((SELECT MAX(id) FROM lists), 0) + 1,
    false
); 