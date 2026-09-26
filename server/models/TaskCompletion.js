const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class TaskCompletion extends Model {}

TaskCompletion.init(
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
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('started', 'completed', 'failed', 'expired'),
      defaultValue: 'started',
    },
    started_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    credits_awarded: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    verification_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'TaskCompletion',
    tableName: 'task_completions',
    underscored: true,
    timestamps: false,
  }
);

module.exports = TaskCompletion;
