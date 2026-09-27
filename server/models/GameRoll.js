const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class GameRoll extends Model {}

GameRoll.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bet_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bet_type: {
      type: DataTypes.ENUM('HI', 'LO'),
      allowNull: false,
    },
    target_condition: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    roll_result: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    multiplier: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 2.0,
    },
    payout: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    profit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('won', 'lost'),
      allowNull: false,
    },
    in_loss_zone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    balance_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'GameRoll',
    tableName: 'game_rolls',
    underscored: true,
    timestamps: true,
  }
);

module.exports = GameRoll;
