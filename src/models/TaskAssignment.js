const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Task = require('./Task');
const User = require('./User');

const TaskAssignment = sequelize.define('TaskAssignment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    task_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'tasks',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'task_assignments',
    timestamps: true
});

// Relaciones
TaskAssignment.belongsTo(Task, { foreignKey: 'task_id' });
TaskAssignment.belongsTo(User, { foreignKey: 'user_id' });

module.exports = TaskAssignment; 