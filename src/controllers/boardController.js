const Board = require('../models/Board');
const BoardMember = require('../models/BoardMember');
const User = require('../models/User');

// Obtener todos los tableros
const getBoards = async (req, res) => {
  try {
    const boards = await Board.findAll({
      include: [
        { model: User, as: 'owner', attributes: ['id', 'full_name', 'email', 'avatar'] }
      ]
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tableros', error: error.message });
  }
};

// Obtener un tablero por ID
const getBoardById = async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'full_name', 'email', 'avatar'] },
        { 
          model: BoardMember, 
          as: 'members',
          include: [
            { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'avatar'] }
          ]
        }
      ]
    });
    
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tablero', error: error.message });
  }
};

// Crear un nuevo tablero
const createBoard = async (req, res) => {
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
    });

    // Crear el registro de miembro para el propietario
    await BoardMember.create({
      board_id: board.id,
      user_id: owner_id,
      role: 'owner'
    });

    const boardWithDetails = await Board.findByPk(board.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'full_name', 'email', 'avatar'] }
      ]
    });

    res.status(201).json(boardWithDetails);
  } catch (error) {
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
        { model: User, as: 'owner', attributes: ['id', 'full_name', 'email', 'avatar'] }
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
        { model: User, as: 'owner', attributes: ['id', 'full_name', 'email', 'avatar'] },
        {
          model: BoardMember,
          as: 'members',
          where: { user_id: userId },
          required: true
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