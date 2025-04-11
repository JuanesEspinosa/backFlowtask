const User = require('./User');
const Board = require('./Board');
const List = require('./List');
const Task = require('./Task');
const Comment = require('./Comment');
const Tag = require('./Tag');

// Asociaciones de Board
Board.belongsTo(User, {
  foreignKey: 'creator_id',
  as: 'boardCreator'
});

Board.belongsToMany(User, {
  through: 'BoardMembers',
  foreignKey: 'board_id',
  otherKey: 'user_id',
  as: 'boardMembers'
});

User.belongsToMany(Board, {
  through: 'BoardMembers',
  foreignKey: 'user_id',
  otherKey: 'board_id',
  as: 'memberBoards'
});

// Asociaciones de List
List.belongsTo(Board, {
  foreignKey: 'board_id',
  as: 'board'
});

Board.hasMany(List, {
  foreignKey: 'board_id',
  as: 'lists'
});

// Asociaciones de Task
Task.belongsTo(List, {
  foreignKey: 'list_id',
  as: 'list'
});

List.hasMany(Task, {
  foreignKey: 'list_id',
  as: 'tasks'
});

Task.belongsTo(User, {
  foreignKey: 'assignee_id',
  as: 'assignee'
});

// Asociaciones de Comment
Comment.belongsTo(Task, {
  foreignKey: 'task_id',
  as: 'task'
});

Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'commentAuthor'
});

Task.hasMany(Comment, {
  foreignKey: 'task_id',
  as: 'comments'
});

// Asociaciones de Tag
Task.belongsToMany(Tag, {
  through: 'TaskTags',
  foreignKey: 'task_id',
  otherKey: 'tag_id',
  as: 'tags'
});

Tag.belongsToMany(Task, {
  through: 'TaskTags',
  foreignKey: 'tag_id',
  otherKey: 'task_id',
  as: 'tasks'
});

module.exports = {
  User,
  Board,
  List,
  Task,
  Comment,
  Tag
}; 