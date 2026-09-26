const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Announcement extends Model {}

Announcement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('info', 'warning', 'promo'),
      defaultValue: 'info',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Announcement',
    tableName: 'announcements',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Announcement;
