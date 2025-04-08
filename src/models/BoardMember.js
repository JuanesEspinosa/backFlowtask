const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Board = require('./Board');

const BoardMember = sequelize.define('BoardMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  board_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'boards',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    defaultValue: 'member',
    allowNull: false
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'board_members',
  timestamps: true,
  createdAt: 'joined_at',
  updatedAt: false
});

// Relaciones
BoardMember.belongsTo(Board, {
  foreignKey: 'board_id',
  as: 'board'
});

BoardMember.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Relaciones en los modelos principales
Board.hasMany(BoardMember, {
  foreignKey: 'board_id',
  as: 'members'
});

User.hasMany(BoardMember, {
  foreignKey: 'user_id',
  as: 'boardMemberships'
});

module.exports = BoardMember; 