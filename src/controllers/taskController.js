const Task = require('../models/Task');
const List = require('../models/List');
const User = require('../models/User');
const TaskAssignment = require('../models/TaskAssignment');
const { sequelize } = require('../config/database');

// Obtener todas las tareas de una lista
const getTasksByList = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { 
        list_id: req.params.listId,
        is_active: true
      },
      include: [
        {
          model: User,
          as: 'assignedUsers',
          attributes: ['id', 'full_name', 'email', 'avatar'],
          through: { attributes: [] }
        }
      ],
      order: [['position', 'ASC']]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ message: 'Error al obtener tareas', error: error.message });
  }
};

// Obtener una tarea por ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        is_active: true
      },
      include: [
        {
          model: User,
          as: 'assignedUsers',
          attributes: ['id', 'full_name', 'email', 'avatar'],
          through: { attributes: [] }
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ message: 'Error al obtener tarea', error: error.message });
  }
};

// Crear una tarea
const createTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { title, description, due_date, priority, tags } = req.body;
    const list_id = req.params.listId;

    // Validaciones básicas
    if (!title) {
      return res.status(400).json({ message: 'El título es requerido' });
    }

    // Obtener la última posición en la lista
    const lastTask = await Task.findOne({
      where: { list_id },
      order: [['position', 'DESC']],
      transaction
    });

    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description,
      due_date,
      priority,
      tags,
      list_id,
      position,
      is_active: true
    }, { transaction });

    await transaction.commit();
    res.status(201).json(task);
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear tarea:', error);
    res.status(500).json({ message: 'Error al crear tarea', error: error.message });
  }
};

// Actualizar una tarea
const updateTask = async (req, res) => {
  try {
    const { title, description, due_date, priority, tags, status } = req.body;
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        is_active: true
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    await task.update({
      title: title || task.title,
      description: description || task.description,
      due_date: due_date || task.due_date,
      priority: priority || task.priority,
      tags: tags || task.tags,
      status: status || task.status
    });

    res.json(task);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ message: 'Error al actualizar tarea', error: error.message });
  }
};

// Eliminar una tarea (soft delete)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        is_active: true
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    await task.update({ is_active: false });
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ message: 'Error al eliminar tarea', error: error.message });
  }
};

// Reordenar tareas dentro de una lista
const reorderTasks = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { taskIds } = req.body;
    const list_id = req.params.listId;

    // Validar que se proporcionaron los IDs de las tareas
    if (!taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({ message: 'Se requiere un array de IDs de tareas' });
    }

    // Actualizar la posición de cada tarea
    await Promise.all(taskIds.map((taskId, index) => 
      Task.update(
        { position: index },
        { 
          where: { 
            id: taskId,
            list_id,
            is_active: true
          },
          transaction
        }
      )
    ));

    await transaction.commit();
    res.json({ message: 'Tareas reordenadas correctamente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al reordenar tareas:', error);
    res.status(500).json({ message: 'Error al reordenar tareas', error: error.message });
  }
};

// Mover una tarea a otra lista
const moveTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { targetListId } = req.body;
    const taskId = req.params.id;

    // Validaciones básicas
    if (!targetListId) {
      return res.status(400).json({ message: 'Se requiere el ID de la lista destino' });
    }

    const task = await Task.findOne({
      where: { 
        id: taskId,
        is_active: true
      },
      transaction
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Obtener la última posición en la lista destino
    const lastTask = await Task.findOne({
      where: { 
        list_id: targetListId,
        is_active: true
      },
      order: [['position', 'DESC']],
      transaction
    });

    const newPosition = lastTask ? lastTask.position + 1 : 0;

    // Actualizar la tarea
    await task.update({
      list_id: targetListId,
      position: newPosition
    }, { transaction });

    await transaction.commit();
    res.json({ message: 'Tarea movida correctamente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al mover tarea:', error);
    res.status(500).json({ message: 'Error al mover tarea', error: error.message });
  }
};

// Asignar usuarios a una tarea
const assignUsers = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { userIds } = req.body;
    const taskId = req.params.id;

    // Validaciones básicas
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'Se requiere un array de IDs de usuarios' });
    }

    const task = await Task.findOne({
      where: { 
        id: taskId,
        is_active: true
      },
      transaction
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Eliminar asignaciones existentes
    await TaskAssignment.destroy({
      where: { task_id: taskId },
      transaction
    });

    // Crear nuevas asignaciones
    await Promise.all(userIds.map(userId =>
      TaskAssignment.create({
        task_id: taskId,
        user_id: userId
      }, { transaction })
    ));

    await transaction.commit();
    res.json({ message: 'Usuarios asignados correctamente' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al asignar usuarios:', error);
    res.status(500).json({ message: 'Error al asignar usuarios', error: error.message });
  }
};

// Agregar etiquetas a una tarea
const addTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        is_active: true
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Combinar etiquetas existentes con nuevas
    const currentTags = task.tags || [];
    const newTags = Array.from(new Set([...currentTags, ...tags]));

    await task.update({ tags: newTags });
    res.json(task);
  } catch (error) {
    console.error('Error al agregar etiquetas:', error);
    res.status(500).json({ message: 'Error al agregar etiquetas', error: error.message });
  }
};

// Agregar comentarios a una tarea
const addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        is_active: true
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    // Agregar el comentario al array de comentarios
    const comments = task.comments || [];
    comments.push({
      text: comment,
      created_at: new Date(),
      user_id: req.user ? req.user.id : null
    });

    await task.update({ comments });
    res.json(task);
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({ message: 'Error al agregar comentario', error: error.message });
  }
};

// Obtener comentarios de una tarea
const getComments = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { 
        id: req.params.id,
        is_active: true
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    res.json(task.comments || []);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
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