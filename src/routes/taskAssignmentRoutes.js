const express = require('express');
const router = express.Router();
const taskAssignmentController = require('../controllers/taskAssignmentController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para asignaciones de tareas
router.get('/', taskAssignmentController.getAllAssignments);
router.get('/:id', taskAssignmentController.getAssignmentById);
router.post('/', taskAssignmentController.createAssignment);
router.put('/:id', taskAssignmentController.updateAssignment);
router.delete('/:id', taskAssignmentController.deleteAssignment);

module.exports = router; 