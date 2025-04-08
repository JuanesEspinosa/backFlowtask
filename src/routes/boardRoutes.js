const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

// Rutas para tableros

// obtener todos los tableros
router.get('/', boardController.getBoards);
// obtener todos los tableros de un usuario
router.get('/user/:userId', boardController.getBoardsByUser);
// obtener un tablero por id
router.get('/:id', boardController.getBoardById);
// crear un tablero
router.post('/', boardController.createBoard);
// actualizar un tablero
router.put('/:id', boardController.updateBoard);
// eliminar un tablero
router.delete('/:id', boardController.deleteBoard);

module.exports = router; 