const TaskAssignment = require('../models/TaskAssignment');
const Task = require('../models/Task');
const User = require('../models/User');

// Obtener todas las asignaciones
exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await TaskAssignment.findAll({
            include: [
                { model: Task, attributes: ['title', 'description'] },
                { model: User, attributes: ['name', 'email'] }
            ]
        });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las asignaciones', error: error.message });
    }
};

// Obtener una asignación por ID
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await TaskAssignment.findByPk(req.params.id, {
            include: [
                { model: Task, attributes: ['title', 'description'] },
                { model: User, attributes: ['name', 'email'] }
            ]
        });
        if (!assignment) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la asignación', error: error.message });
    }
};

// Crear una nueva asignación
exports.createAssignment = async (req, res) => {
    try {
        const { task_id, user_id } = req.body;
        const assignment = await TaskAssignment.create({
            task_id,
            user_id
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la asignación', error: error.message });
    }
};

// Actualizar una asignación
exports.updateAssignment = async (req, res) => {
    try {
        const { task_id, user_id } = req.body;
        const assignment = await TaskAssignment.findByPk(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }

        await assignment.update({
            task_id,
            user_id
        });

        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la asignación', error: error.message });
    }
};

// Eliminar una asignación
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await TaskAssignment.findByPk(req.params.id);
        
        if (!assignment) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }

        await assignment.destroy();
        res.json({ message: 'Asignación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la asignación', error: error.message });
    }
}; 