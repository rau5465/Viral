const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Transaction extends Model {}

Transaction.init(
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
    type: {
      type: DataTypes.ENUM('credit', 'debit'),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'signup_bonus',
        'referral',
        'task',
        'recharge',
        'adjustment',
        'bonus_multiplier'
      ),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    balance_after: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Transaction;
