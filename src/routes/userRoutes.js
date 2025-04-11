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

// obtener todos los usuarios

router.get('/', getUsers);
// obtener un usuario por id
router.get('/:id', getUserById);
// crear un usuario
router.post('/', createUser);
// actualizar un usuario
router.put('/:id', updateUser);
// desactivar un usuario
router.patch('/:id/deactivate', deactivateUser);
// reactivar un usuario
router.patch('/:id/reactivate', reactivateUser);

module.exports = router; 