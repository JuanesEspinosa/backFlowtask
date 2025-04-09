const { sequelize, fixSequences } = require('../config/database');
const User = require('./User');
const Board = require('./Board');
const BoardMember = require('./BoardMember');
const List = require('./List');

const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
    
    // Sincronizar todos los modelos
    await sequelize.sync({ force: false });
    
    // Corregir secuencias de autoincremento
    await fixSequences();
    
    console.log('Tablas sincronizadas correctamente');

    // Asociaciones User - Board (a través de owner_id)
    User.hasMany(Board, { 
      foreignKey: 'owner_id',
      as: 'ownedBoards' 
    });
    Board.belongsTo(User, { 
      foreignKey: 'owner_id',
      as: 'boardOwner'
    });

    // Asociaciones User - Board (a través de BoardMember)
    User.belongsToMany(Board, { 
      through: BoardMember,
      foreignKey: 'user_id',
      otherKey: 'board_id',
      as: 'memberInBoards'
    });
    Board.belongsToMany(User, { 
      through: BoardMember,
      foreignKey: 'board_id',
      otherKey: 'user_id',
      as: 'memberUsers'
    });

    // Asociaciones Board - BoardMember
    Board.hasMany(BoardMember, { 
      foreignKey: 'board_id',
      as: 'boardMemberships'
    });
    BoardMember.belongsTo(Board, { 
      foreignKey: 'board_id',
      as: 'parentBoard'
    });

    // Asociaciones User - BoardMember
    User.hasMany(BoardMember, { 
      foreignKey: 'user_id',
      as: 'userMemberships'
    });
    BoardMember.belongsTo(User, { 
      foreignKey: 'user_id',
      as: 'memberUser'
    });

    // Asociaciones Board - List
    Board.hasMany(List, {
      foreignKey: 'board_id',
      as: 'lists'
    });
    List.belongsTo(Board, {
      foreignKey: 'board_id',
      as: 'parentBoard'
    });

    console.log('Asociaciones configuradas correctamente');
  } catch (error) {
    console.error('Error al conectar con PostgreSQL:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Board,
  BoardMember,
  List,
  initModels
}; 