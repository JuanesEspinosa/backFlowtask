const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

// Rutas para listas

// Obtener todas las listas de un tablero
router.get('/board/:boardId', listController.getListsByBoard);

// Obtener una lista por ID
router.get('/:id', listController.getListById);

// Crear una nueva lista
router.post('/board/:boardId', listController.createList);

// Actualizar una lista
router.put('/:id', listController.updateList);

// Eliminar una lista
router.delete('/:id', listController.deleteList);

// Reordenar listas
router.put('/board/:boardId/reorder', listController.reorderLists);

module.exports = router; 