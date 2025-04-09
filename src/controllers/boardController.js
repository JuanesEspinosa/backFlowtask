const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const User = require('../models/User');
const List = require('../models/List');
const { sequelize } = require('../config/database');

// Obtener todos los tableros
const getBoards = async (req, res) => {
  try {
    const boards = await Board.findAll({
      include: [
        { 
          model: User, 
          as: 'boardOwner', 
          attributes: ['id', 'full_name', 'email', 'avatar']
        },
        {
          model: BoardMember,
          as: 'boardMemberships',
          include: [{
            model: User,
            as: 'memberUser',
            attributes: ['id', 'full_name', 'email', 'avatar']
          }]
        },
        {
          model: List,
          as: 'lists'
        }
      ]
    });
    res.json(boards);
  } catch (error) {
    console.error('Error al obtener tableros:', error);
    res.status(500).json({ message: 'Error al obtener tableros', error: error.message });
  }
};

// Obtener un tablero por ID
const getBoardById = async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'boardOwner', 
          attributes: ['id', 'full_name', 'email', 'avatar']
        },
        {
          model: BoardMember,
          as: 'boardMemberships',
          include: [{
            model: User,
            as: 'memberUser',
            attributes: ['id', 'full_name', 'email', 'avatar']
          }]
        },
        {
          model: List,
          as: 'lists',
          order: [['position', 'ASC']]
        }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    res.json(board);
  } catch (error) {
    console.error('Error al obtener tablero:', error);
    res.status(500).json({ message: 'Error al obtener tablero', error: error.message });
  }
};

// Crear un nuevo tablero
const createBoard = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, description, visibility, owner_id } = req.body;
    
    // Validaciones básicas
    if (!name) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    if (visibility && !['private', 'public'].includes(visibility)) {
      return res.status(400).json({ message: 'La visibilidad debe ser private o public' });
    }

    const board = await Board.create({
      name,
      description,
      visibility: visibility || 'private',
      owner_id
    }, { transaction });

    // Crear el registro de miembro para el propietario
    await BoardMember.create({
      board_id: board.id,
      user_id: owner_id,
      role: 'owner'
    }, { transaction });

    // Crear listas por defecto
    const defaultLists = [
      { name: 'Por hacer', position: 0 },
      { name: 'En progreso', position: 1 },
      { name: 'Completado', position: 2 }
    ];

    await Promise.all(defaultLists.map(list => 
      List.create({
        ...list,
        board_id: board.id
      }, { transaction })
    ));

    const boardWithDetails = await Board.findByPk(board.id, {
      include: [
        { model: User, as: 'boardOwner', attributes: ['id', 'full_name', 'email', 'avatar'] },
        { model: List, as: 'lists', order: [['position', 'ASC']] }
      ],
      transaction
    });

    await transaction.commit();
    res.status(201).json(boardWithDetails);
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Error al crear tablero', error: error.message });
  }
};

// Actualizar un tablero
const updateBoard = async (req, res) => {
  try {
    const { name, description, visibility } = req.body;
    const board = await Board.findByPk(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Validaciones básicas
    if (visibility && !['private', 'public'].includes(visibility)) {
      return res.status(400).json({ message: 'La visibilidad debe ser private o public' });
    }

    await board.update({ 
      name: name || board.name,
      description: description || board.description,
      visibility: visibility || board.visibility
    });
    
    const updatedBoard = await Board.findByPk(board.id, {
      include: [
        { model: User, as: 'boardOwner', attributes: ['id', 'full_name', 'email', 'avatar'] }
      ]
    });

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar tablero', error: error.message });
  }
};

// Eliminar un tablero
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id);
    
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    await board.destroy();
    res.json({ message: 'Tablero eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar tablero', error: error.message });
  }
};

// Obtener tableros por usuario
const getBoardsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const boards = await Board.findAll({
      include: [
        { 
          model: User, 
          as: 'boardOwner', 
          attributes: ['id', 'full_name', 'email', 'avatar'],
          where: { is_active: true }
        },
        {
          model: BoardMember,
          as: 'boardMemberships',
          where: { user_id: userId },
          required: true,
          include: [
            { 
              model: User, 
              as: 'memberUser', 
              attributes: ['id', 'full_name', 'email', 'avatar'],
              where: { is_active: true }
            }
          ]
        }
      ]
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tableros del usuario', error: error.message });
  }
};

module.exports = {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardsByUser
}; 