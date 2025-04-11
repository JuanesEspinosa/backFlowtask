const List = require('../models/List');
const Board = require('../models/Board');
const Task = require('../models/Task');
const { sequelize } = require('../config/database');

// Obtener todas las listas de un tablero
const getListsByBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    
    const lists = await List.findAll({
      where: { board_id: boardId },
      order: [['position', 'ASC']],
      include: [
        {
          model: Task,
          as: 'tasks',
          order: [['position', 'ASC']]
        }
      ]
    });
    
    res.json(lists);
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las listas del tablero',
      error: error.message
    });
  }
};

// Obtener una lista por ID
const getListById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const list = await List.findByPk(id, {
      include: [
        {
          model: Task,
          as: 'tasks',
          order: [['position', 'ASC']]
        }
      ]
    });
    
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }
    
    res.json(list);
  } catch (error) {
    console.error('Error al obtener lista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista',
      error: error.message
    });
  }
};

// Crear una nueva lista
const createList = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { boardId } = req.params;
    const { title, position } = req.body;
    
    // Verificar si el tablero existe
    const board = await Board.findByPk(boardId);
    if (!board) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tablero no encontrado'
      });
    }
    
    // Si no se proporciona posición, obtener la última posición y sumar 1
    let listPosition = position;
    if (listPosition === undefined) {
      const lastList = await List.findOne({
        where: { board_id: boardId },
        order: [['position', 'DESC']]
      });
      listPosition = lastList ? lastList.position + 1 : 0;
    }
    
    const list = await List.create({
      board_id: boardId,
      title,
      position: listPosition
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Lista creada correctamente',
      list
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear lista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la lista',
      error: error.message
    });
  }
};

// Actualizar una lista
const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, position } = req.body;
    
    const list = await List.findByPk(id);
    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }
    
    await list.update({
      title: title || list.title,
      position: position !== undefined ? position : list.position
    });
    
    res.json({
      success: true,
      message: 'Lista actualizada correctamente',
      list
    });
  } catch (error) {
    console.error('Error al actualizar lista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la lista',
      error: error.message
    });
  }
};

// Eliminar una lista
const deleteList = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const list = await List.findByPk(id);
    if (!list) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }
    
    // Eliminar todas las tareas de la lista
    await Task.destroy({
      where: { list_id: id },
      transaction
    });
    
    // Eliminar la lista
    await list.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Lista eliminada correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar lista:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la lista',
      error: error.message
    });
  }
};

// Reordenar listas
const reorderLists = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { boardId } = req.params;
    const { listIds } = req.body;
    
    // Verificar si todas las listas existen y pertenecen al tablero
    const lists = await List.findAll({
      where: {
        id: listIds,
        board_id: boardId
      }
    });
    
    if (lists.length !== listIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Una o más listas no existen o no pertenecen al tablero'
      });
    }
    
    // Actualizar las posiciones
    await Promise.all(
      listIds.map((listId, index) =>
        List.update(
          { position: index },
          {
            where: { id: listId },
            transaction
          }
        )
      )
    );
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Listas reordenadas correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al reordenar listas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar las listas',
      error: error.message
    });
  }
};

module.exports = {
  getListsByBoard,
  getListById,
  createList,
  updateList,
  deleteList,
  reorderLists
}; 