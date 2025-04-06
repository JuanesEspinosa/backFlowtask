const bcrypt = require('bcrypt');
const { User } = require('../models');

// Registro de usuarios
const register = async (req, res) => {
  try {
    const { full_name, email, password, avatar } = req.body;
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      avatar
    });

    // Excluir la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Login de usuarios
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar la contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Excluir la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json({
      message: 'Login exitoso',
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

module.exports = {
  register,
  login
}; 