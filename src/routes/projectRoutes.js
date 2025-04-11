const express = require('express');
const router = express.Router();
const {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    deactivateProject
} = require('../controllers/projectController');

// Obtener todos los proyectos
router.get('/', getAllProjects);

// Obtener un proyecto específico
router.get('/:id', getProjectById);

// Crear un nuevo proyecto
router.post('/', createProject);

// Actualizar un proyecto existente
router.put('/:id', updateProject);

// Eliminar un proyecto
router.delete('/:id', deleteProject);

// Desactivar un proyecto
router.patch('/:id/deactivate', deactivateProject);

module.exports = router; 