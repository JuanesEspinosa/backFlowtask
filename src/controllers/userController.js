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

// Eliminar un usuario
const deleteUser = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener todos los tableros donde el usuario es propietario
    const ownedBoards = await Board.findAll({
      where: { owner_id: userId }
    });

    // Para cada tablero, buscar un nuevo propietario
    for (const board of ownedBoards) {
      // Buscar el siguiente administrador del tablero
      const nextAdmin = await BoardMember.findOne({
        where: {
          board_id: board.id,
          user_id: { [sequelize.Op.ne]: userId }, // No seleccionar al usuario actual
          role: 'admin'
        }
      });

      if (nextAdmin) {
        // Si hay un administrador, transferirle la propiedad
        await BoardMember.update(
          { role: 'owner' },
          { 
            where: { id: nextAdmin.id },
            transaction: t
          }
        );
        await Board.update(
          { owner_id: nextAdmin.user_id },
          { 
            where: { id: board.id },
            transaction: t
          }
        );
      } else {
        // Si no hay administrador, buscar cualquier miembro
        const nextMember = await BoardMember.findOne({
          where: {
            board_id: board.id,
            user_id: { [sequelize.Op.ne]: userId }
          }
        });

        if (nextMember) {
          // Si hay un miembro, convertirlo en propietario
          await BoardMember.update(
            { role: 'owner' },
            { 
              where: { id: nextMember.id },
              transaction: t
            }
          );
          await Board.update(
            { owner_id: nextMember.user_id },
            { 
              where: { id: board.id },
              transaction: t
            }
          );
        } else {
          // Si no hay más miembros, eliminar el tablero
          await board.destroy({ transaction: t });
        }
      }
    }

    // Eliminar todas las membresías del usuario
    await BoardMember.destroy({
      where: { user_id: userId },
      transaction: t
    });

    // Finalmente, eliminar el usuario
    await user.destroy({ transaction: t });

    await t.commit();
    res.json({ 
      message: 'Usuario eliminado correctamente',
      details: {
        boardsTransferred: ownedBoards.length,
        userDeleted: true
      }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ 
      message: 'Error al eliminar usuario', 
      error: error.message 
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
}; 