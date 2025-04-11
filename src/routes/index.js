const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');
const boardRoutes = require('./boardRoutes');
const boardMemberRoutes = require('./boardMemberRoutes');
const listRoutes = require('./listRoutes');
const taskRoutes = require('./taskRoutes');
const taskAssignmentRoutes = require('./taskAssignmentRoutes');
const taskCommentRoutes = require('./taskCommentRoutes');
const tagRoutes = require('./tagRoutes');
const taskTagRoutes = require('./taskTagRoutes');

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas de tableros
router.use('/boards', boardRoutes);

// Rutas de miembros de tableros
router.use('/board-members', boardMemberRoutes);

// Rutas de listas
router.use('/lists', listRoutes);

// Rutas de tareas
router.use('/tasks', taskRoutes);

// Rutas de asignaciones de tareas
router.use('/task-assignments', taskAssignmentRoutes);

// Rutas de comentarios de tareas
router.use('/task-comments', taskCommentRoutes);

// Rutas de etiquetas
router.use('/tags', tagRoutes);

// Rutas de relación entre tareas y etiquetas
router.use('/task-tags', taskTagRoutes);

module.exports = router; 