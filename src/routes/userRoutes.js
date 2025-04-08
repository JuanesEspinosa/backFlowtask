const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas de usuarios

// obtener todos los usuarios

router.get('/', userController.getUsers);
// obtener un usuario por id
router.get('/:id', userController.getUserById);
// crear un usuario
router.post('/', userController.createUser);
// actualizar un usuario
router.put('/:id', userController.updateUser);
// desactivar un usuario
router.put('/:id/deactivate', userController.deactivateUser);
// reactivar un usuario
router.put('/:id/reactivate', userController.reactivateUser);

module.exports = router; 