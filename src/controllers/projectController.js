const Project = require('../models/Project');
const Board = require('../models/Board');
const { sequelize } = require('../config/database');

// Obtener todos los proyectos
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [{
                model: Board,
                as: 'projectBoards',
                attributes: ['id', 'name', 'description', 'visibility', 'status']
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los proyectos', error: error.message });
    }
};

// Obtener un proyecto por ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id, {
            include: [{
                model: Board,
                as: 'projectBoards',
                attributes: ['id', 'name', 'description', 'visibility', 'status']
            }]
        });

        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el proyecto', error: error.message });
    }
};

// Crear un nuevo proyecto
const createProject = async (req, res) => {
    try {
        const { name, description, category, other_category, color } = req.body;

        const project = await Project.create({
            name,
            description,
            category,
            other_category,
            color
        });

        const projectWithDetails = await Project.findByPk(project.id, {
            include: [{
                model: Board,
                as: 'projectBoards',
                attributes: ['id', 'name', 'description', 'visibility', 'status']
            }]
        });

        res.status(201).json(projectWithDetails);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el proyecto', error: error.message });
    }
};

// Actualizar un proyecto
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, other_category, color } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        await project.update({
            name,
            description,
            category,
            other_category,
            color
        });

        const updatedProject = await Project.findByPk(id, {
            include: [{
                model: Board,
                as: 'projectBoards',
                attributes: ['id', 'name', 'description', 'visibility', 'status']
            }]
        });

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el proyecto', error: error.message });
    }
};

// Eliminar un proyecto
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        await project.destroy();
        res.json({ message: 'Proyecto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el proyecto', error: error.message });
    }
};

// Desactivar un proyecto
const deactivateProject = async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
        const project = await Project.findByPk(id);
        if (!project) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        // Desactivar todos los tableros del proyecto
        await Board.update(
            { status: 'inactive' },
            { 
                where: { project_id: id },
                transaction 
            }
        );

        // Desactivar el proyecto
        await project.update({ status: 'inactive' }, { transaction });

        await transaction.commit();
        res.json({ 
            message: 'Proyecto y sus tableros desactivados correctamente',
            details: {
                projectId: id,
                status: 'inactive'
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error al desactivar proyecto:', error);
        res.status(500).json({ message: 'Error al desactivar proyecto' });
    }
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    deactivateProject
}; 