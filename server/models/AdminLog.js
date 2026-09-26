const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class AdminLog extends Model {}

AdminLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'AdminLog',
    tableName: 'admin_logs',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = AdminLog;
