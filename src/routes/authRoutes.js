const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Rutas de autenticación

// registrar un usuario
router.post('/register', register);
// iniciar sesión
router.post('/login', login);

module.exports = router; 