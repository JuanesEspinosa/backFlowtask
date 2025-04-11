const { sequelize } = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Board = require('./Board');
const BoardMember = require('./BoardMember');
const List = require('./List');
const Task = require('./Task');
const TaskAssignment = require('./TaskAssignment');

const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    
    // Sincronizar todos los modelos
    await sequelize.sync({ force: true });
    console.log('Tablas sincronizadas correctamente');

    // Asociaciones User - Project
    User.hasMany(Project, {
      foreignKey: 'owner_id',
      as: 'projects'
    });
    Project.belongsTo(User, {
      foreignKey: 'owner_id',
      as: 'owner'
    });

    // Asociaciones Project - Board
    Project.hasMany(Board, {
      foreignKey: 'project_id',
      as: 'projectBoards'
    });
    Board.belongsTo(Project, {
      foreignKey: 'project_id',
      as: 'project'
    });

    // Asociaciones User - Board (a través de owner_id)
    User.hasMany(Board, { 
      foreignKey: 'owner_id',
      as: 'ownedBoards' 
    });
    Board.belongsTo(User, {
      foreignKey: 'owner_id',
      as: 'owner'
    });

    // Asociaciones User - Board (a través de BoardMember)
    User.belongsToMany(Board, { 
      through: BoardMember,
      foreignKey: 'user_id',
      otherKey: 'board_id',
      as: 'memberOfBoards'
    });
    Board.belongsToMany(User, { 
      through: BoardMember,
      foreignKey: 'board_id',
      otherKey: 'user_id',
      as: 'boardMembers'
    });

    // Asociaciones Board - List
    Board.hasMany(List, {
      foreignKey: 'board_id',
      as: 'lists'
    });
    List.belongsTo(Board, {
      foreignKey: 'board_id',
      as: 'board'
    });

    // Asociaciones List - Task
    List.hasMany(Task, {
      foreignKey: 'list_id',
      as: 'tasks'
    });
    Task.belongsTo(List, {
      foreignKey: 'list_id',
      as: 'list'
    });

    // Asociaciones Task - User (a través de TaskAssignment)
    Task.belongsToMany(User, {
      through: TaskAssignment,
      foreignKey: 'task_id',
      otherKey: 'user_id',
      as: 'assignedUsers'
    });
    User.belongsToMany(Task, {
      through: TaskAssignment,
      foreignKey: 'user_id',
      otherKey: 'task_id',
      as: 'assignedTasks'
    });

    console.log('Asociaciones configuradas correctamente');
  } catch (error) {
    console.error('Error al inicializar modelos:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Project,
  Board,
  BoardMember,
  List,
  Task,
  TaskAssignment,
  initModels
}; 