const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class UserYouTubeSubscription extends Model {}

UserYouTubeSubscription.init(
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
    channel_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    partner_channel_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_subscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    credits_claimed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    credits_awarded: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'UserYouTubeSubscription',
    tableName: 'user_youtube_subscriptions',
    underscored: true,
    timestamps: true,
  }
);

module.exports = UserYouTubeSubscription;
