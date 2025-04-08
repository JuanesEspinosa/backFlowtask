const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Rutas de usuarios

// obtener todos los usuarios
router.get('/', getUsers);
// obtener un usuario por id
router.get('/:id', getUserById);
// crear un usuario
router.post('/', createUser);
// actualizar un usuario
router.put('/:id', updateUser);
// eliminar un usuario
router.delete('/:id', deleteUser);

module.exports = router; 