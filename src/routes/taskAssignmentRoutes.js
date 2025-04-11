const express = require('express');
const router = express.Router();
const taskAssignmentController = require('../controllers/taskAssignmentController');

// Obtener todas las asignaciones de una tarea
router.get('/task/:taskId', taskAssignmentController.getAssignmentsByTask);

// Obtener todas las asignaciones de un usuario
router.get('/user/:userId', taskAssignmentController.getAssignmentsByUser);

// Asignar usuarios a una tarea
router.post('/task/:taskId', taskAssignmentController.assignUsersToTask);

// Eliminar una asignación
router.delete('/:id', taskAssignmentController.removeAssignment);

module.exports = router; 