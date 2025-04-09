const BoardMember = require('../models/BoardMember');
const Board = require('../models/Board');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Obtener todos los miembros de un tablero
const getBoardMembers = async (req, res) => {
  try {
    const { boardId } = req.params;
    const members = await BoardMember.findAll({
      where: { board_id: boardId },
      include: [
        {
          model: User,
          as: 'memberUser',
          attributes: ['id', 'full_name', 'email', 'avatar']
        }
      ]
    });
    res.json(members);
  } catch (error) {
    console.error('Error al obtener miembros:', error);
    res.status(500).json({ 
      message: 'Error al obtener miembros del tablero', 
      error: error.message 
    });
  }
};

// Agregar miembro a un tablero
const addMemberToBoard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { board_id, user_id, role } = req.body;

    // Verificar si el tablero existe
    const board = await Board.findByPk(board_id);
    if (!board) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Tablero no encontrado' });
    }

    // Verificar si el usuario existe
    const user = await User.findByPk(user_id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario ya es miembro del tablero
    const existingMember = await BoardMember.findOne({
      where: {
        board_id,
        user_id
      }
    });

    if (existingMember) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'El usuario ya es miembro de este tablero',
        member: existingMember
      });
    }

    // Validar el rol
    if (role && !['owner', 'admin', 'member'].includes(role)) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Rol inválido. Los roles permitidos son: owner, admin, member' 
      });
    }

    // Crear el nuevo miembro
    const boardMember = await BoardMember.create({
      board_id,
      user_id,
      role: role || 'member'
    }, { transaction });

    // Obtener los detalles completos del miembro
    const memberWithDetails = await BoardMember.findByPk(boardMember.id, {
      include: [
        {
          model: User,
          as: 'memberUser',
          attributes: ['id', 'full_name', 'email', 'avatar']
        },
        {
          model: Board,
          as: 'parentBoard',
          attributes: ['id', 'name', 'description']
        }
      ],
      transaction
    });

    await transaction.commit();
    res.status(201).json(memberWithDetails);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al agregar miembro:', error);
    res.status(500).json({ 
      message: 'Error al agregar miembro al tablero', 
      error: error.message 
    });
  }
};

// Actualizar rol de un miembro
const updateMemberRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const member = await BoardMember.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    if (!['owner', 'admin', 'member'].includes(role)) {
      return res.status(400).json({ 
        message: 'Rol inválido. Los roles permitidos son: owner, admin, member' 
      });
    }

    await member.update({ role });
    
    const updatedMember = await BoardMember.findByPk(id, {
      include: [
        {
          model: User,
          as: 'memberUser',
          attributes: ['id', 'full_name', 'email', 'avatar']
        }
      ]
    });

    res.json(updatedMember);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ 
      message: 'Error al actualizar rol del miembro', 
      error: error.message 
    });
  }
};

// Eliminar miembro
const removeMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await BoardMember.findByPk(id);
    if (!member) {
      return res.status(404).json({ message: 'Miembro no encontrado' });
    }

    await member.destroy();
    res.json({ message: 'Miembro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    res.status(500).json({ 
      message: 'Error al eliminar miembro', 
      error: error.message 
    });
  }
};

module.exports = {
  getBoardMembers,
  addMemberToBoard,
  updateMemberRole,
  removeMember
}; 