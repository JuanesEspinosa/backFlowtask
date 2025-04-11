const TaskAssignment = require('../models/TaskAssignment');
const Task = require('../models/Task');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Obtener todas las asignaciones de una tarea
const getAssignmentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const assignments = await TaskAssignment.findAll({
      where: { task_id: taskId },
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'full_name', 'email', 'avatar']
        }
      ]
    });
    
    res.json(assignments);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asignaciones de la tarea',
      error: error.message
    });
  }
};

// Obtener todas las asignaciones de un usuario
const getAssignmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const assignments = await TaskAssignment.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'description', 'priority', 'due_date']
        }
      ]
    });
    
    res.json(assignments);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asignaciones del usuario',
      error: error.message
    });
  }
};

// Asignar usuarios a una tarea
const assignUsersToTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { taskId } = req.params;
    const { user_ids } = req.body;
    
    // Verificar si la tarea existe
    const task = await Task.findByPk(taskId);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar si los usuarios existen
    const users = await User.findAll({
      where: { id: user_ids }
    });
    
    if (users.length !== user_ids.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Uno o más usuarios no existen'
      });
    }
    
    // Crear las asignaciones
    const assignments = await Promise.all(
      user_ids.map(userId => 
        TaskAssignment.create({
          task_id: taskId,
          user_id: userId
        }, { transaction })
      )
    );
    
    // Obtener las asignaciones con detalles
    const assignmentsWithDetails = await TaskAssignment.findAll({
      where: { task_id: taskId },
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'full_name', 'email', 'avatar']
        }
      ],
      transaction
    });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Usuarios asignados correctamente',
      assignments: assignmentsWithDetails
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al asignar usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar usuarios a la tarea',
      error: error.message
    });
  }
};

// Eliminar una asignación
const removeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const assignment = await TaskAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Asignación no encontrada'
      });
    }
    
    await assignment.destroy();
    
    res.json({
      success: true,
      message: 'Asignación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la asignación',
      error: error.message
    });
  }
};

module.exports = {
  getAssignmentsByTask,
  getAssignmentsByUser,
  assignUsersToTask,
  removeAssignment
}; 