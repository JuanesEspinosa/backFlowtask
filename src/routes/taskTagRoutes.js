const express = require('express');
const router = express.Router();
const taskTagController = require('../controllers/taskTagController');

// Obtener todas las etiquetas de una tarea
router.get('/task/:taskId', taskTagController.getTagsByTask);

// Agregar etiquetas a una tarea
router.post('/task/:taskId', taskTagController.addTagsToTask);

// Eliminar etiquetas de una tarea
router.delete('/task/:taskId', taskTagController.removeTagsFromTask);

// Obtener todas las tareas con una etiqueta específica
router.get('/tag/:tagId/tasks', taskTagController.getTasksByTag);

module.exports = router; 