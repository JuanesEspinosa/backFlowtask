const User = require('../models/User');
const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const { full_name, email, password, avatar } = req.body;
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      avatar
    });

    // Excluir la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const { full_name, email, password, avatar } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se proporciona una nueva contraseña, encriptarla
    if (password) {
      req.body.password = await bcrypt.hash(password, 10);
    }

    await user.update(req.body);
    
    // Excluir la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

// Desactivar un usuario
const deactivateUser = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Desactivar todos los tableros del usuario
    const boards = await Board.findAll({ where: { ownerId: id } });
    for (const board of boards) {
      await board.update({ status: 'inactive' }, { transaction });
    }

    // Desactivar membresías
    await BoardMember.update(
      { status: 'inactive' },
      { where: { userId: id }, transaction }
    );

    // Desactivar usuario
    await user.update({ status: 'inactive' }, { transaction });

    await transaction.commit();
    res.json({ 
      message: 'Usuario desactivado correctamente',
      details: {
        userId: id,
        status: 'inactive',
        boardsDeactivated: boards.length
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ message: 'Error al desactivar usuario' });
  }
};

// Reactivar un usuario
const reactivateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.update({ status: 'active' });
    res.json({ 
      message: 'Usuario reactivado correctamente',
      user: {
        id: user.id,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error al reactivar usuario:', error);
    res.status(500).json({ message: 'Error al reactivar usuario' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser
}; 