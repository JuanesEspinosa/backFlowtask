const express = require('express');
const router = express.Router();
const {
  getBoardMembers,
  addMemberToBoard,
  updateMemberRole,
  removeMember
} = require('../controllers/boardMemberController');

// Rutas para miembros del tablero

// obtener todos los miembros de un tablero
router.get('/board/:boardId', getBoardMembers);
// agregar un miembro a un tablero
router.post('/', addMemberToBoard);
// actualizar el rol de un miembro de un tablero
router.put('/:id', updateMemberRole);
// eliminar un miembro de un tablero
router.delete('/:id', removeMember);

module.exports = router; 