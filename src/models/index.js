const { sequelize } = require('../config/database');
const User = require('./User');
const Board = require('./Board');
const List = require('./List');
const Task = require('./Task');
const Tag = require('./Tag');
const TaskComment = require('./TaskComment');
const TaskAssignment = require('./TaskAssignment');

// Asociaciones entre modelos
const initModels = () => {
  // Usuario - Tablero (creador)
  User.hasMany(Board, {
    foreignKey: 'creator_id',
    as: 'createdBoards'
  });
  Board.belongsTo(User, {
    foreignKey: 'creator_id',
    as: 'creator'
  });

  // Usuario - Tablero (miembros)
  User.belongsToMany(Board, {
    through: 'board_members',
    foreignKey: 'user_id',
    otherKey: 'board_id',
    as: 'memberOfBoards'
  });
  Board.belongsToMany(User, {
    through: 'board_members',
    foreignKey: 'board_id',
    otherKey: 'user_id',
    as: 'boardMembers'
  });

  // Tablero - Lista
  Board.hasMany(List, {
    foreignKey: 'board_id',
    as: 'lists'
  });
  List.belongsTo(Board, {
    foreignKey: 'board_id',
    as: 'board'
  });

  // Lista - Tarea
  List.hasMany(Task, {
    foreignKey: 'list_id',
    as: 'tasks'
  });
  Task.belongsTo(List, {
    foreignKey: 'list_id',
    as: 'list'
  });

  // Usuario - Tarea (asignaciones)
  User.belongsToMany(Task, {
    through: TaskAssignment,
    foreignKey: 'user_id',
    otherKey: 'task_id',
    as: 'assignedTasks'
  });
  Task.belongsToMany(User, {
    through: TaskAssignment,
    foreignKey: 'task_id',
    otherKey: 'user_id',
    as: 'assignedUsers'
  });

  // Tarea - Etiqueta
  Task.belongsToMany(Tag, {
    through: 'task_tags',
    foreignKey: 'task_id',
    otherKey: 'tag_id',
    as: 'tags'
  });
  Tag.belongsToMany(Task, {
    through: 'task_tags',
    foreignKey: 'tag_id',
    otherKey: 'task_id',
    as: 'taggedTasks'
  });

  // Tarea - Comentario
  Task.hasMany(TaskComment, {
    foreignKey: 'task_id',
    as: 'comments'
  });
  TaskComment.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'parentTask'
  });

  // Usuario - Comentario
  User.hasMany(TaskComment, {
    foreignKey: 'user_id',
    as: 'userComments'
  });
  TaskComment.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'author'
  });
};

// Sincronizar modelos con la base de datos
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Tablas sincronizadas correctamente');
  } catch (error) {
    console.error('Error al sincronizar tablas:', error);
    throw error;
  }
};

// Inicializar la aplicación
const initApp = async () => {
  try {
    await syncModels();
    initModels();
    console.log('Modelos inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar modelos:', error);
    throw error;
  }
};

module.exports = {
  initApp,
  User,
  Board,
  List,
  Task,
  Tag,
  TaskComment,
  TaskAssignment
}; 