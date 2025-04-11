const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Obtener todas las etiquetas
router.get('/', tagController.getAllTags);

// Obtener una etiqueta por ID
router.get('/:id', tagController.getTagById);

// Crear una nueva etiqueta
router.post('/', tagController.createTag);

// Actualizar una etiqueta
router.put('/:id', tagController.updateTag);

// Eliminar una etiqueta
router.delete('/:id', tagController.deleteTag);

// Obtener todas las tareas con una etiqueta específica
router.get('/:id/tasks', tagController.getTasksByTag);

module.exports = router; 