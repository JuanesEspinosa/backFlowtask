const BoardMember = require('../models/BoardMember');
const Board = require('../models/Board');
const User = require('../models/User');

// Obtener todos los miembros de un tablero
const getBoardMembers = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const members = await BoardMember.findAll({
      where: { board_id: boardId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'avatar'] }
      ]
    });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener miembros del tablero', error: error.message });
  }
};

// Agregar un miembro al tablero
const addBoardMember = async (req, res) => {
  try {
    const { board_id, user_id, role } = req.body;

    // Validaciones básicas
    if (!board_id || !user_id) {
      return res.status(400).json({ message: 'Se requiere board_id y user_id' });
    }

    if (role && !['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'El rol debe ser admin o member' });
    }

    // Verificar si el tablero existe
    const board = await Board.findByPk(board_id);
    if (!board) {
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Verificar si el usuario existe
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario ya es miembro del tablero
    const existingMember = await BoardMember.findOne({
      where: { board_id, user_id }
    });
    if (existingMember) {
      return res.status(400).json({ message: 'El usuario ya es miembro del tablero' });
    }

    // Crear un nuevo miembro del tablero
    const member = await BoardMember.create({
      board_id,
      user_id,
      role: role || 'member'
    });

    const memberWithDetails = await BoardMember.findByPk(member.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'avatar'] }
      ]
    });

    res.status(201).json(memberWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar miembro al tablero', error: error.message });
  }
};

// Actualizar el rol de un miembro
const updateMemberRole = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const userId = req.params.userId;
    const { role } = req.body;

    // Validaciones básicas
    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'El rol debe ser admin o member' });
    }

    // Verificar si el miembro existe
    const member = await BoardMember.findOne({
      where: { board_id: boardId, user_id: userId }
    });

    if (!member) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    // No permitir cambiar el rol del propietario
    if (member.role === 'owner') {
      return res.status(403).json({ message: 'No se puede cambiar el rol del propietario' });
    }

    await member.update({ role });

    const updatedMember = await BoardMember.findByPk(member.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'avatar'] }
      ]
    });

    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar rol del miembro', error: error.message });
  }
};

// Eliminar un miembro del tablero
const removeBoardMember = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    const userId = req.params.userId;

    // Verificar si el miembro existe
    const member = await BoardMember.findOne({
      where: { board_id: boardId, user_id: userId }
    });

    if (!member) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    // No permitir eliminar al propietario
    if (member.role === 'owner') {
      return res.status(403).json({ message: 'No se puede eliminar al propietario del tablero' });
    }

    await member.destroy();
    res.json({ message: 'Miembro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar miembro del tablero', error: error.message });
  }
};

module.exports = {
  getBoardMembers,
  addBoardMember,
  updateMemberRole,
  removeBoardMember
}; 