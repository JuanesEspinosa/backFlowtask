const User = require('../models/User');
const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const Project = require('../models/Project');

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
    console.log('Buscando usuario con ID:', id);
    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    console.log('Usuario encontrado:', user.email);

    try {
      console.log('Desactivando proyectos del usuario...');
      // Desactivar todos los proyectos del usuario
      await Project.update(
        { status: 'inactive' },
        { 
          where: { owner_id: id },
          transaction 
        }
      );

      console.log('Obteniendo IDs de proyectos...');
      // Obtener los IDs de los proyectos del usuario
      const userProjects = await Project.findAll({
        where: { owner_id: id },
        attributes: ['id']
      });
      const projectIds = userProjects.map(project => project.id);
      console.log('IDs de proyectos:', projectIds);

      if (projectIds.length > 0) {
        console.log('Desactivando tableros de los proyectos...');
        // Desactivar todos los tableros de los proyectos del usuario
        await Board.update(
          { status: 'inactive' },
          { 
            where: { 
              project_id: {
                [sequelize.Op.in]: projectIds
              }
            },
            transaction 
          }
        );
      }

      console.log('Desactivando tableros donde el usuario es owner...');
      // Desactivar todos los tableros donde el usuario es owner
      await Board.update(
        { status: 'inactive' },
        { 
          where: { owner_id: id },
          transaction 
        }
      );

      console.log('Desactivando membresías...');
      // Desactivar membresías
      await BoardMember.update(
        { status: 'inactive' },
        { 
          where: { user_id: id },
          transaction 
        }
      );

      console.log('Desactivando usuario...');
      // Desactivar usuario
      await user.update({ is_active: false }, { transaction });

      await transaction.commit();
      console.log('Transacción completada exitosamente');
      
      res.json({ 
        message: 'Usuario y sus recursos desactivados correctamente',
        details: {
          userId: id,
          is_active: false
        }
      });
    } catch (error) {
      console.error('Error durante la desactivación:', error);
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({ 
      message: 'Error al desactivar usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Reactivar un usuario
const reactivateUser = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();

  try {
    console.log('Buscando usuario con ID:', id);
    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    console.log('Usuario encontrado:', user.email);

    try {
      console.log('Reactivando proyectos del usuario...');
      // Reactivar todos los proyectos del usuario
      await Project.update(
        { status: 'active' },
        { 
          where: { owner_id: id },
          transaction 
        }
      );

      console.log('Obteniendo IDs de proyectos...');
      // Obtener los IDs de los proyectos del usuario
      const userProjects = await Project.findAll({
        where: { owner_id: id },
        attributes: ['id']
      });
      const projectIds = userProjects.map(project => project.id);
      console.log('IDs de proyectos:', projectIds);

      if (projectIds.length > 0) {
        console.log('Reactivando tableros de los proyectos...');
        // Reactivar todos los tableros de los proyectos del usuario
        await Board.update(
          { status: 'active' },
          { 
            where: { 
              project_id: {
                [sequelize.Op.in]: projectIds
              }
            },
            transaction 
          }
        );
      }

      console.log('Reactivando tableros donde el usuario es owner...');
      // Reactivar todos los tableros donde el usuario es owner
      await Board.update(
        { status: 'active' },
        { 
          where: { owner_id: id },
          transaction 
        }
      );

      console.log('Reactivando membresías...');
      // Reactivar membresías
      await BoardMember.update(
        { status: 'active' },
        { 
          where: { user_id: id },
          transaction 
        }
      );

      console.log('Reactivando usuario...');
      // Reactivar usuario
      await user.update({ is_active: true }, { transaction });

      await transaction.commit();
      console.log('Transacción completada exitosamente');

      res.json({ 
        message: 'Usuario y sus recursos reactivados correctamente',
        details: {
          userId: id,
          is_active: true
        }
      });
    } catch (error) {
      console.error('Error durante la reactivación:', error);
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al reactivar usuario:', error);
    if (!transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({ 
      message: 'Error al reactivar usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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