-- Convertir tablas a UUID

-- Crear extensión uuid-ossp si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Usuarios
ALTER TABLE users 
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- Tableros
ALTER TABLE boards 
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN owner_id SET DATA TYPE UUID USING (uuid_generate_v4());

-- Miembros de tablero
ALTER TABLE board_members 
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN board_id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN user_id SET DATA TYPE UUID USING (uuid_generate_v4());

-- Listas
ALTER TABLE lists 
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN board_id SET DATA TYPE UUID USING (uuid_generate_v4());

-- Tareas
ALTER TABLE tasks 
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN list_id SET DATA TYPE UUID USING (uuid_generate_v4());

-- Asignaciones de tareas
ALTER TABLE task_assignments 
  ALTER COLUMN id DROP DEFAULT,
  ALTER COLUMN id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN task_id SET DATA TYPE UUID USING (uuid_generate_v4()),
  ALTER COLUMN user_id SET DATA TYPE UUID USING (uuid_generate_v4());

-- Actualizar las restricciones de clave foránea
ALTER TABLE boards
  DROP CONSTRAINT IF EXISTS boards_owner_id_fkey,
  ADD CONSTRAINT boards_owner_id_fkey 
    FOREIGN KEY (owner_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

ALTER TABLE board_members
  DROP CONSTRAINT IF EXISTS board_members_board_id_fkey,
  ADD CONSTRAINT board_members_board_id_fkey 
    FOREIGN KEY (board_id) 
    REFERENCES boards(id) 
    ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS board_members_user_id_fkey,
  ADD CONSTRAINT board_members_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

ALTER TABLE lists
  DROP CONSTRAINT IF EXISTS lists_board_id_fkey,
  ADD CONSTRAINT lists_board_id_fkey 
    FOREIGN KEY (board_id) 
    REFERENCES boards(id) 
    ON DELETE CASCADE;

ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_list_id_fkey,
  ADD CONSTRAINT tasks_list_id_fkey 
    FOREIGN KEY (list_id) 
    REFERENCES lists(id) 
    ON DELETE CASCADE;

ALTER TABLE task_assignments
  DROP CONSTRAINT IF EXISTS task_assignments_task_id_fkey,
  ADD CONSTRAINT task_assignments_task_id_fkey 
    FOREIGN KEY (task_id) 
    REFERENCES tasks(id) 
    ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS task_assignments_user_id_fkey,
  ADD CONSTRAINT task_assignments_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE; 