const express = require('express');
const router = express.Router();
const boardMemberController = require('../controllers/boardMemberController');

// Rutas para miembros del tablero

// obtener todos los miembros de un tablero
router.get('/board/:boardId', boardMemberController.getBoardMembers);
// agregar un miembro a un tablero
router.post('/', boardMemberController.addBoardMember);
// actualizar el rol de un miembro de un tablero
router.put('/:boardId/:userId', boardMemberController.updateMemberRole);
// eliminar un miembro de un tablero
router.delete('/:boardId/:userId', boardMemberController.removeBoardMember);

module.exports = router; 