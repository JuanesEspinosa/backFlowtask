const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Board = sequelize.define('Board', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  owner_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'owner_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  project_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'private',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'boards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Asociaciones se definirán en models/index.js
module.exports = Board; 