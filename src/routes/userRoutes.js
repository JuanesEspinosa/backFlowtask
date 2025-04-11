const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser
} = require('../controllers/userController');

// Rutas de usuarios

// Obtener todos los usuarios
router.get('/', getUsers);

// Obtener un usuario por ID
router.get('/:id', getUserById);

// Crear un nuevo usuario
router.post('/', createUser);

// Actualizar un usuario
router.put('/:id', updateUser);

// Desactivar un usuario
router.put('/:id/deactivate', deactivateUser);

// Reactivar un usuario
router.put('/:id/reactivate', reactivateUser);

module.exports = router; 