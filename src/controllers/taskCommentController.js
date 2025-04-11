const TaskComment = require('../models/TaskComment');
const Task = require('../models/Task');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Obtener todos los comentarios de una tarea
const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    const comments = await TaskComment.findAll({
      where: { task_id: taskId },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los comentarios de la tarea',
      error: error.message
    });
  }
};

// Obtener un comentario por ID
const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await TaskComment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    res.json(comment);
  } catch (error) {
    console.error('Error al obtener comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el comentario',
      error: error.message
    });
  }
};

// Crear un nuevo comentario
const createComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { taskId } = req.params;
    const { content, user_id } = req.body;
    
    const task = await Task.findByPk(taskId);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar que el usuario existe
    const user = await User.findByPk(user_id);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Crear el comentario
    const comment = await TaskComment.create({
      task_id: taskId,
      user_id,
      content
    }, { transaction });
    
    await transaction.commit();
    
    // Obtener el comentario con la información del usuario
    const createdComment = await TaskComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Comentario creado correctamente',
      comment: createdComment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el comentario',
      error: error.message
    });
  }
};

// Actualizar un comentario
const updateComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const comment = await TaskComment.findByPk(id);
    if (!comment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    // Actualizar el comentario
    await comment.update({
      content
    }, { transaction });
    
    await transaction.commit();
    
    // Obtener el comentario actualizado con la información del usuario
    const updatedComment = await TaskComment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Comentario actualizado correctamente',
      comment: updatedComment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el comentario',
      error: error.message
    });
  }
};

// Eliminar un comentario
const deleteComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const comment = await TaskComment.findByPk(id);
    if (!comment) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }
    
    // Eliminar el comentario
    await comment.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Comentario eliminado correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el comentario',
      error: error.message
    });
  }
};

module.exports = {
  getCommentsByTask,
  getCommentById,
  createComment,
  updateComment,
  deleteComment
}; 