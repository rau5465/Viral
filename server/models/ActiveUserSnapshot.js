const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class ActiveUserSnapshot extends Model {}

ActiveUserSnapshot.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    live_users_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    authenticated_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    guest_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'ActiveUserSnapshot',
    tableName: 'active_user_snapshots',
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['timestamp'],
      },
    ],
  }
);

module.exports = ActiveUserSnapshot;
