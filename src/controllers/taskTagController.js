const Task = require('../models/Task');
const Tag = require('../models/Tag');
const { sequelize } = require('../config/database');

// Obtener todas las etiquetas de una tarea
const getTagsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    const tags = await task.getTags();
    
    res.json(tags);
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las etiquetas de la tarea',
      error: error.message
    });
  }
};

// Agregar etiquetas a una tarea
const addTagsToTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { taskId } = req.params;
    const { tag_ids } = req.body;
    
    const task = await Task.findByPk(taskId);
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
    
    // Obtener las etiquetas actualizadas
    const updatedTags = await task.getTags();
    
    res.json({
      success: true,
      message: 'Etiquetas agregadas correctamente',
      tags: updatedTags
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

// Eliminar etiquetas de una tarea
const removeTagsFromTask = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { taskId } = req.params;
    const { tag_ids } = req.body;
    
    const task = await Task.findByPk(taskId);
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
    
    // Eliminar etiquetas de la tarea
    await task.removeTags(tag_ids, { transaction });
    
    await transaction.commit();
    
    // Obtener las etiquetas actualizadas
    const updatedTags = await task.getTags();
    
    res.json({
      success: true,
      message: 'Etiquetas eliminadas correctamente',
      tags: updatedTags
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar etiquetas de la tarea',
      error: error.message
    });
  }
};

// Obtener todas las tareas con una etiqueta específica
const getTasksByTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    
    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }
    
    const tasks = await tag.getTasks({
      include: [
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }
      ],
      order: [['position', 'ASC']]
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tareas con la etiqueta',
      error: error.message
    });
  }
};

module.exports = {
  getTagsByTask,
  addTagsToTask,
  removeTagsFromTask,
  getTasksByTag
}; 