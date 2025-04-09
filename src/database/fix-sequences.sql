-- Reiniciar secuencia de boards
SELECT setval(
    pg_get_serial_sequence('boards', 'id'),
    1,
    false
);

-- Reiniciar secuencia de users
SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    1,
    false
);

-- Reiniciar secuencia de lists
SELECT setval(
    pg_get_serial_sequence('lists', 'id'),
    1,
    false
);

-- Reiniciar secuencia de tasks
SELECT setval(
    pg_get_serial_sequence('tasks', 'id'),
    1,
    false
);

-- Reiniciar secuencia de board_members
SELECT setval(
    pg_get_serial_sequence('board_members', 'id'),
    1,
    false
); 