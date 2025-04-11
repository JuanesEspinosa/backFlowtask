const express = require('express');
const router = express.Router();
const { 
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard
} = require('../controllers/boardController');

// Rutas para tableros

// Obtener todos los tableros
router.get('/', getAllBoards);

// Obtener un tablero específico
router.get('/:id', getBoardById);

// Crear un nuevo tablero
router.post('/', createBoard);

// Actualizar un tablero
router.put('/:id', updateBoard);

// Eliminar un tablero
router.delete('/:id', deleteBoard);

module.exports = router; 