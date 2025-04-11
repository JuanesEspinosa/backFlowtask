const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Task = require('./Task');
const Tag = require('./Tag');

const TaskTag = sequelize.define('TaskTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tags',
      key: 'id'
    }
  }
}, {
  tableName: 'task_tags',
  timestamps: false,
  underscored: true
});

// Relaciones
TaskTag.belongsTo(Task, {
  foreignKey: 'task_id',
  as: 'task'
});

TaskTag.belongsTo(Tag, {
  foreignKey: 'tag_id',
  as: 'tag'
});

module.exports = TaskTag; 