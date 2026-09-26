const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Recharge extends Model {}

Recharge.init(
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
    mobile_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    operator: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    credits_spent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    api_response: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Recharge',
    tableName: 'recharges',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Recharge;
