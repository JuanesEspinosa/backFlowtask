const Board = require('../models/Board');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Obtener todos los tableros
const getAllBoards = async (req, res) => {
  try {
    console.log('Iniciando búsqueda de tableros...');
    
    const boards = await Board.findAll({
      include: [
        {
          model: User,
          as: 'boardCreator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'boardMembers',
          attributes: ['id', 'full_name', 'email'],
          through: { attributes: [] }
        }
      ],
      order: [['id', 'ASC']]
    });
    
    console.log(`Se encontraron ${boards.length} tableros`);
    
    if (boards.length === 0) {
      return res.json({
        success: true,
        message: 'No hay tableros disponibles',
        data: []
      });
    }
    
    res.json({
      success: true,
      message: 'Tableros obtenidos correctamente',
      data: boards
    });
  } catch (error) {
    console.error('Error al obtener tableros:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tableros',
      error: error.message
    });
  }
};

// Obtener un tablero por ID
const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Buscando tablero con ID: ${id}`);
    
    const board = await Board.findByPk(id, {
      include: [
        {
          model: User,
          as: 'boardCreator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'boardMembers',
          attributes: ['id', 'full_name', 'email'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!board) {
      console.log(`No se encontró el tablero con ID: ${id}`);
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado'
      });
    }
    
    console.log(`Tablero encontrado: ${board.title}`);
    res.json({
      success: true,
      message: 'Tablero obtenido correctamente',
      data: board
    });
  } catch (error) {
    console.error('Error al obtener tablero:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el tablero',
      error: error.message
    });
  }
};

// Crear un nuevo tablero
const createBoard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { title, name, description, creator_id, member_ids } = req.body;
    console.log('Datos recibidos:', { title, name, description, creator_id, member_ids });
    
    // Verificar si el creador existe
    const creator = await User.findByPk(creator_id);
    if (!creator) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario creador no encontrado'
      });
    }
    
    // Usar name como título si title no está presente
    const boardTitle = title || name;
    
    if (!boardTitle) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El título del tablero es requerido'
      });
    }
    
    // Crear el tablero
    const board = await Board.create({
      title: boardTitle,
      description,
      creator_id
    }, { transaction });
    
    console.log('Tablero creado:', board.toJSON());
    
    // Agregar miembros si se proporcionan
    if (member_ids && member_ids.length > 0) {
      await board.addBoardMembers(member_ids, { transaction });
      console.log('Miembros agregados al tablero');
    }
    
    await transaction.commit();
    
    // Obtener el tablero creado con sus relaciones
    const createdBoard = await Board.findByPk(board.id, {
      include: [
        {
          model: User,
          as: 'boardCreator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'boardMembers',
          attributes: ['id', 'full_name', 'email'],
          through: { attributes: [] }
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Tablero creado correctamente',
      data: createdBoard
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear tablero:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al crear el tablero',
      error: error.message
    });
  }
};

// Actualizar un tablero
const updateBoard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { title, description, member_ids } = req.body;
    console.log(`Actualizando tablero ${id}:`, { title, description, member_ids });
    
    const board = await Board.findByPk(id);
    if (!board) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado'
      });
    }
    
    // Actualizar datos básicos
    await board.update({
      title: title || board.title,
      description: description || board.description
    }, { transaction });
    
    console.log('Datos básicos actualizados');
    
    // Actualizar miembros si se proporcionan
    if (member_ids) {
      await board.setBoardMembers(member_ids, { transaction });
      console.log('Miembros actualizados');
    }
    
    await transaction.commit();
    
    // Obtener el tablero actualizado con sus relaciones
    const updatedBoard = await Board.findByPk(id, {
      include: [
        {
          model: User,
          as: 'boardCreator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'boardMembers',
          attributes: ['id', 'full_name', 'email'],
          through: { attributes: [] }
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Tablero actualizado correctamente',
      data: updatedBoard
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar tablero:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el tablero',
      error: error.message
    });
  }
};

// Eliminar un tablero
const deleteBoard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    console.log(`Eliminando tablero ${id}`);
    
    const board = await Board.findByPk(id);
    if (!board) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado'
      });
    }
    
    // Eliminar el tablero
    await board.destroy({ transaction });
    console.log('Tablero eliminado');
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Tablero eliminado correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar tablero:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el tablero',
      error: error.message
    });
  }
};

module.exports = {
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard
}; 