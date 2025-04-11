const Tag = require('../models/Tag');
const Task = require('../models/Task');

// Obtener todas las etiquetas
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    
    res.json(tags);
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las etiquetas',
      error: error.message
    });
  }
};

// Obtener una etiqueta por ID
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }
    
    res.json(tag);
  } catch (error) {
    console.error('Error al obtener etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la etiqueta',
      error: error.message
    });
  }
};

// Crear una nueva etiqueta
const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    // Verificar si ya existe una etiqueta con el mismo nombre
    const existingTag = await Tag.findOne({
      where: { name, is_active: true }
    });
    
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una etiqueta con ese nombre'
      });
    }
    
    const tag = await Tag.create({
      name,
      color,
      is_active: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Etiqueta creada correctamente',
      tag
    });
  } catch (error) {
    console.error('Error al crear etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la etiqueta',
      error: error.message
    });
  }
};

// Actualizar una etiqueta
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }
    
    // Verificar si ya existe otra etiqueta con el mismo nombre
    if (name !== tag.name) {
      const existingTag = await Tag.findOne({
        where: { name, is_active: true }
      });
      
      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una etiqueta con ese nombre'
        });
      }
    }
    
    await tag.update({ name, color });
    
    res.json({
      success: true,
      message: 'Etiqueta actualizada correctamente',
      tag
    });
  } catch (error) {
    console.error('Error al actualizar etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la etiqueta',
      error: error.message
    });
  }
};

// Eliminar una etiqueta (soft delete)
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await Tag.findByPk(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }
    
    await tag.update({ is_active: false });
    
    res.json({
      success: true,
      message: 'Etiqueta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la etiqueta',
      error: error.message
    });
  }
};

// Obtener todas las tareas con una etiqueta específica
const getTasksByTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await Tag.findByPk(id, {
      include: [
        {
          model: Task,
          as: 'tasks',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }
    
    res.json(tag.tasks);
  } catch (error) {
    console.error('Error al obtener tareas por etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tareas de la etiqueta',
      error: error.message
    });
  }
};

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getTasksByTag
}; 