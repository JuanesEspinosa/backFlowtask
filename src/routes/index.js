const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const projectRoutes = require('./projectRoutes');
const boardRoutes = require('./boardRoutes');
// const listRoutes = require('./listRoutes');
// const taskRoutes = require('./taskRoutes');

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas de proyectos
router.use('/projects', projectRoutes);

// Rutas de tableros
router.use('/boards', boardRoutes);

// Rutas de listas y tareas (temporalmente deshabilitadas)
// router.use('/lists', listRoutes);
// router.use('/tasks', taskRoutes);

module.exports = router; 