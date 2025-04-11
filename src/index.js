const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { initModels } = require('./models');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const boardMemberRoutes = require('./routes/boardMemberRoutes');
const taskAssignmentRoutes = require('./routes/taskAssignmentRoutes');
const listRoutes = require('./routes/listRoutes');

const app = express();

// Inicializar modelos y conectar a la base de datos
initModels();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API' });
});

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de tableros
app.use('/api/boards', boardRoutes);

// Rutas de miembros del tablero
app.use('/api/board-members', boardMemberRoutes);

// Rutas de listas
app.use('/api/lists', listRoutes);

// Rutas de asignaciones de tareas
app.use('/api/task-assignments', taskAssignmentRoutes);

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 