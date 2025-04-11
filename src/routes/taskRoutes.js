const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Rutas para tareas

// Obtener todas las tareas de una lista
router.get('/list/:listId', taskController.getTasksByList);

// Obtener una tarea por ID
router.get('/:id', taskController.getTaskById);

// Crear una nueva tarea
router.post('/list/:listId', taskController.createTask);

// Actualizar una tarea
router.put('/:id', taskController.updateTask);

// Eliminar una tarea
router.delete('/:id', taskController.deleteTask);

// Reordenar tareas
router.put('/list/:listId/reorder', taskController.reorderTasks);

// Mover tarea entre listas
router.put('/:id/move', taskController.moveTask);

// Asignar usuarios a una tarea
router.put('/:id/assign', taskController.assignUsers);

// Agregar etiquetas a una tarea
router.put('/:id/tags', taskController.addTags);

// Agregar comentarios a una tarea
router.post('/:id/comments', taskController.addComment);

// Obtener comentarios de una tarea
router.get('/:id/comments', taskController.getComments);

module.exports = router; 