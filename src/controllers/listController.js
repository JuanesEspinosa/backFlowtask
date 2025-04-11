const List = require('../models/List');
const Board = require('../models/Board');
const { sequelize } = require('../config/database');

// Obtener todas las listas de un tablero
const getListsByBoard = async (req, res) => {
    try {
        const { boardId } = req.params;

        // Verificar si el tablero existe
        const board = await Board.findByPk(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Tablero no encontrado' });
        }

        const lists = await List.findAll({
            where: { board_id: boardId },
            order: [['position', 'ASC']],
            include: [{
                model: Board,
                as: 'parentBoard',
                attributes: ['id', 'name']
            }]
        });

        // Transformar los IDs para que sean relativos al tablero
        const transformedLists = lists.map((list, index) => {
            const plainList = list.get({ plain: true });
            plainList.display_id = index + 1;
            return plainList;
        });

        res.json(transformedLists);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las listas', error: error.message });
    }
};

// Obtener una lista por ID
const getListById = async (req, res) => {
    try {
        const { id } = req.params;
        const list = await List.findByPk(id, {
            include: [{
                model: Board,
                as: 'parentBoard',
                attributes: ['id', 'name']
            }]
        });

        if (!list) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        // Obtener el número de lista dentro del tablero
        const listsBeforeCurrent = await List.count({
            where: {
                board_id: list.board_id,
                id: { [sequelize.Op.lt]: list.id }
            }
        });

        const plainList = list.get({ plain: true });
        plainList.display_id = listsBeforeCurrent + 1;

        res.json(plainList);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la lista', error: error.message });
    }
};

// Crear una lista personalizada
const createCustomList = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { name, position } = req.body;

        // Verificar si el tablero existe
        const board = await Board.findByPk(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Tablero no encontrado' });
        }

        // Obtener la última posición si no se proporciona una
        let listPosition = position;
        if (listPosition === undefined) {
            const lastList = await List.findOne({
                where: { board_id: boardId },
                order: [['position', 'DESC']]
            });
            listPosition = lastList ? lastList.position + 1 : 0;
        }

        const list = await List.create({
            name,
            position: listPosition,
            board_id: boardId
        });

        // Obtener el número de lista dentro del tablero
        const listsBeforeCurrent = await List.count({
            where: {
                board_id: boardId,
                id: { [sequelize.Op.lt]: list.id }
            }
        });

        const listWithDetails = await List.findByPk(list.id, {
            include: [{
                model: Board,
                as: 'parentBoard',
                attributes: ['id', 'name']
            }]
        });

        const plainList = listWithDetails.get({ plain: true });
        plainList.display_id = listsBeforeCurrent + 1;

        res.status(201).json(plainList);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la lista', error: error.message });
    }
};

// Actualizar una lista
const updateList = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position } = req.body;

        const list = await List.findByPk(id);
        if (!list) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        await list.update({ name, position });

        // Obtener el número de lista dentro del tablero
        const listsBeforeCurrent = await List.count({
            where: {
                board_id: list.board_id,
                id: { [sequelize.Op.lt]: list.id }
            }
        });

        const updatedList = await List.findByPk(id, {
            include: [{
                model: Board,
                as: 'parentBoard',
                attributes: ['id', 'name']
            }]
        });

        const plainList = updatedList.get({ plain: true });
        plainList.display_id = listsBeforeCurrent + 1;

        res.json(plainList);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la lista', error: error.message });
    }
};

// Eliminar una lista
const deleteList = async (req, res) => {
    try {
        const { id } = req.params;
        const list = await List.findByPk(id);

        if (!list) {
            return res.status(404).json({ message: 'Lista no encontrada' });
        }

        await list.destroy();
        res.json({ message: 'Lista eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la lista', error: error.message });
    }
};

// Reordenar listas
const reorderLists = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { listIds } = req.body;

        // Verificar si el tablero existe
        const board = await Board.findByPk(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Tablero no encontrado' });
        }

        // Actualizar las posiciones de las listas
        await Promise.all(listIds.map(async (listId, index) => {
            await List.update(
                { position: index },
                { where: { id: listId, board_id: boardId } }
            );
        }));

        // Obtener las listas actualizadas
        const lists = await List.findAll({
            where: { board_id: boardId },
            order: [['position', 'ASC']],
            include: [{
                model: Board,
                as: 'parentBoard',
                attributes: ['id', 'name']
            }]
        });

        // Transformar los IDs para que sean relativos al tablero
        const transformedLists = lists.map((list, index) => {
            const plainList = list.get({ plain: true });
            plainList.display_id = index + 1;
            return plainList;
        });

        res.json(transformedLists);
    } catch (error) {
        res.status(500).json({ message: 'Error al reordenar las listas', error: error.message });
    }
};

module.exports = {
    getListsByBoard,
    getListById,
    createCustomList,
    updateList,
    deleteList,
    reorderLists
}; 