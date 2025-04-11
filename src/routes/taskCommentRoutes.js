const express = require('express');
const router = express.Router();
const taskCommentController = require('../controllers/taskCommentController');

// Obtener todos los comentarios de una tarea
router.get('/task/:taskId', taskCommentController.getCommentsByTask);

// Obtener un comentario por ID
router.get('/:id', taskCommentController.getCommentById);

// Crear un nuevo comentario
router.post('/task/:taskId', taskCommentController.createComment);

// Actualizar un comentario
router.put('/:id', taskCommentController.updateComment);

// Eliminar un comentario
router.delete('/:id', taskCommentController.deleteComment);

module.exports = router; 