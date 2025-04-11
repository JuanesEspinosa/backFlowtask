const User = require('../models/User');
const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    console.log('Iniciando búsqueda de usuarios...');
    
    // Primero, obtener el conteo total
    const totalUsers = await User.count();
    console.log('Total de usuarios en la base de datos:', totalUsers);
    
    // Obtener todos los usuarios con sus atributos
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'avatar', 'is_active', 'created_at', 'updated_at'],
      order: [['id', 'ASC']]
    });
    
    console.log('Usuarios encontrados:', users.length);
    console.log('Datos de usuarios:', JSON.stringify(users, null, 2));
    
    if (users.length === 0) {
      return res.json({
        success: true,
        message: 'No hay usuarios registrados',
        data: []
      });
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Buscando usuario con ID: ${id}`);
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'avatar', 'is_active', 'created_at', 'updated_at']
    });
    
    if (!user) {
      console.log(`No se encontró el usuario con ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    console.log(`Usuario encontrado: ${user.full_name}`);
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: error.message
    });
  }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { full_name, email, password } = req.body;
    console.log('Datos recibidos:', { full_name, email });
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    const user = await User.create({
      full_name,
      email,
      password
    }, { transaction });
    
    console.log('Usuario creado:', user.toJSON());
    await transaction.commit();
    
    // Excluir el password de la respuesta
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      data: userWithoutPassword
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario',
      error: error.message
    });
  }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { full_name, email, password } = req.body;
    console.log(`Actualizando usuario ${id}:`, { full_name, email });
    
    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si el nuevo email ya existe
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }
    
    await user.update({
      full_name: full_name || user.full_name,
      email: email || user.email,
      password: password || user.password
    }, { transaction });
    
    console.log('Usuario actualizado');
    await transaction.commit();
    
    // Excluir el password de la respuesta
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    res.json({
      success: true,
      message: 'Usuario actualizado correctamente',
      data: userWithoutPassword
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario',
      error: error.message
    });
  }
};

// Desactivar un usuario
const deactivateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    console.log(`Desactivando usuario ${id}`);
    
    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    await user.update({ is_active: false }, { transaction });
    console.log('Usuario desactivado');
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Usuario desactivado correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al desactivar usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar el usuario',
      error: error.message
    });
  }
};

// Reactivar un usuario
const reactivateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    console.log(`Reactivando usuario ${id}`);
    
    const user = await User.findByPk(id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    await user.update({ is_active: true }, { transaction });
    console.log('Usuario reactivado');
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Usuario reactivado correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al reactivar usuario:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al reactivar el usuario',
      error: error.message
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