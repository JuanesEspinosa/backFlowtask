require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/database');
const User = require('./models/User');
const Board = require('./models/Board');
const List = require('./models/List');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Tag = require('./models/Tag');

// Cargar asociaciones después de importar los modelos
require('./models/associations');

const userRoutes = require('./routes/userRoutes');
const boardRoutes = require('./routes/boardRoutes');
const authRoutes = require('./routes/authRoutes');
const boardMemberRoutes = require('./routes/boardMemberRoutes');
// const listRoutes = require('./routes/listRoutes');
// const taskRoutes = require('./routes/taskRoutes');
// const commentRoutes = require('./routes/commentRoutes');
// const tagRoutes = require('./routes/tagRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/board-members', boardMemberRoutes);
// app.use('/api/lists', listRoutes);
// app.use('/api/tasks', taskRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/tags', tagRoutes);

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Sincronizar base de datos y levantar servidor
const PORT = process.env.PORT || 3000;

async function initializeServer() {
  try {
    // Conectar y sincronizar la base de datos
    await connectDB();
    
    // Verificar si hay usuarios
    const userCount = await User.count();
    console.log(`Número de usuarios en la base de datos: ${userCount}`);
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log('Rutas disponibles:');
      console.log('- GET /api/users');
      console.log('- GET /api/boards');
      console.log('- GET /test');
    });
  } catch (error) {
    console.error('Error al inicializar el servidor:', error);
    console.error('Detalles del error:', error.original || error);
    process.exit(1);
  }
}

initializeServer(); 