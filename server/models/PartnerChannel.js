const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class PartnerChannel extends Model {}

PartnerChannel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    partner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    channel_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    channel_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    channel_handle: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    channel_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    credits_reward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subscriber_count: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'PartnerChannel',
    tableName: 'partner_channels',
    underscored: true,
    timestamps: true,
  }
);

module.exports = PartnerChannel;
