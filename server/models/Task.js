const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Task extends Model {}

Task.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        'visit_site',
        'watch_ad',
        'youtube_subscribe',
        'watch_video',
        'social_follow',
        'other'
      ),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    credits_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    daily_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_completions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    modelName: 'Task',
    tableName: 'tasks',
    underscored: true,
    timestamps: true,
  }
);

module.exports = Task;
