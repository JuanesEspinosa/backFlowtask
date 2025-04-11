const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');
const User = require('../models/User');
const Tag = require('../models/Tag');
const TaskComment = require('../models/TaskComment');
const { sequelize } = require('../config/database');

// Obtener todas las tareas de una lista
const getTasksByList = async (req, res) => {
  try {
    const { listId } = req.params;
    
    const tasks = await Task.findAll({
      where: { list_id: listId },
      order: [['position', 'ASC']],
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tareas de la lista',
      error: error.message
    });
  }
};

// Obtener una tarea por ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la tarea',
      error: error.message
    });
  }
};

// Crear una nueva tarea
const createTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { listId } = req.params;
    const { title, description, due_date, priority, assignee_id, position, tag_ids } = req.body;
    
    // Verificar si la lista existe
    const list = await List.findByPk(listId);
    if (!list) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Lista no encontrada'
      });
    }
    
    // Si no se proporciona posición, obtener la última posición y sumar 1
    let taskPosition = position;
    if (taskPosition === undefined) {
      const lastTask = await Task.findOne({
        where: { list_id: listId },
        order: [['position', 'DESC']]
      });
      taskPosition = lastTask ? lastTask.position + 1 : 0;
    }
    
    // Crear la tarea
    const task = await Task.create({
      list_id: listId,
      title,
      description,
      due_date,
      priority,
      assignee_id,
      position: taskPosition
    }, { transaction });
    
    // Asociar etiquetas si se proporcionan
    if (tag_ids && tag_ids.length > 0) {
      await task.setTags(tag_ids, { transaction });
    }
    
    await transaction.commit();
    
    // Obtener la tarea con sus relaciones
    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Tarea creada correctamente',
      task: createdTask
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la tarea',
      error: error.message
    });
  }
};

// Actualizar una tarea
const updateTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { title, description, due_date, priority, assignee_id, position, tag_ids, list_id } = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Si se está moviendo la tarea a otra lista, verificar que la lista existe
    if (list_id && list_id !== task.list_id) {
      const list = await List.findByPk(list_id);
      if (!list) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Lista destino no encontrada'
        });
      }
    }
    
    // Actualizar la tarea
    await task.update({
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      due_date: due_date || task.due_date,
      priority: priority || task.priority,
      assignee_id: assignee_id || task.assignee_id,
      position: position !== undefined ? position : task.position,
      list_id: list_id || task.list_id
    }, { transaction });
    
    // Actualizar etiquetas si se proporcionan
    if (tag_ids) {
      await task.setTags(tag_ids, { transaction });
    }
    
    await transaction.commit();
    
    // Obtener la tarea actualizada con sus relaciones
    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Tarea actualizada correctamente',
      task: updatedTask
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la tarea',
      error: error.message
    });
  }
};

// Eliminar una tarea
const deleteTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const task = await Task.findByPk(id);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Eliminar la tarea
    await task.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Tarea eliminada correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la tarea',
      error: error.message
    });
  }
};

// Reordenar tareas
const reorderTasks = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { listId } = req.params;
    const { taskIds } = req.body;
    
    // Verificar si todas las tareas existen y pertenecen a la lista
    const tasks = await Task.findAll({
      where: {
        id: taskIds,
        list_id: listId
      }
    });
    
    if (tasks.length !== taskIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Una o más tareas no existen o no pertenecen a la lista'
      });
    }
    
    // Actualizar las posiciones
    await Promise.all(
      taskIds.map((taskId, index) =>
        Task.update(
          { position: index },
          {
            where: { id: taskId },
            transaction
          }
        )
      )
    );
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Tareas reordenadas correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al reordenar tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar las tareas',
      error: error.message
    });
  }
};

// Mover tarea entre listas
const moveTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { listId, position } = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar si la lista destino existe
    const list = await List.findByPk(listId);
    if (!list) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Lista destino no encontrada'
      });
    }
    
    // Si no se proporciona posición, obtener la última posición y sumar 1
    let taskPosition = position;
    if (taskPosition === undefined) {
      const lastTask = await Task.findOne({
        where: { list_id: listId },
        order: [['position', 'DESC']]
      });
      taskPosition = lastTask ? lastTask.position + 1 : 0;
    }
    
    // Actualizar la tarea
    await task.update({
      list_id: listId,
      position: taskPosition
    }, { transaction });
    
    await transaction.commit();
    
    res.json({
      success: true,
      message: 'Tarea movida correctamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al mover tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error al mover la tarea',
      error: error.message
    });
  }
};

// Asignar usuarios a una tarea
const assignUsers = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { user_ids } = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar que todos los usuarios existen
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
    
    // Asignar usuarios a la tarea
    await task.setAssignees(user_ids, { transaction });
    
    await transaction.commit();
    
    // Obtener la tarea actualizada con sus relaciones
    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignees',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Usuarios asignados correctamente',
      task: updatedTask
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

// Agregar etiquetas a una tarea
const addTags = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { tag_ids } = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar que todas las etiquetas existen
    const tags = await Tag.findAll({
      where: { id: tag_ids }
    });
    
    if (tags.length !== tag_ids.length) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Una o más etiquetas no existen'
      });
    }
    
    // Agregar etiquetas a la tarea
    await task.addTags(tag_ids, { transaction });
    
    await transaction.commit();
    
    // Obtener la tarea actualizada con sus relaciones
    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignees',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Etiquetas agregadas correctamente',
      task: updatedTask
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al agregar etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar etiquetas a la tarea',
      error: error.message
    });
  }
};

// Agregar un comentario a una tarea
const addComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { content, user_id } = req.body;
    
    const task = await Task.findByPk(id);
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
      task_id: id,
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
      message: 'Comentario agregado correctamente',
      comment: createdComment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al agregar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar el comentario',
      error: error.message
    });
  }
};

// Obtener comentarios de una tarea
const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    const comments = await TaskComment.findAll({
      where: { task_id: id },
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

module.exports = {
  getTasksByList,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  moveTask,
  assignUsers,
  addTags,
  addComment,
  getComments
}; 