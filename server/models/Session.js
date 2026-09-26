const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Session extends Model {}

Session.init(
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
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Session;
